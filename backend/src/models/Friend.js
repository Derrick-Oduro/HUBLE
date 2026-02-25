const database = require("../config/database");

class Friend {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.friend_id = data.friend_id;
    this.status = data.status; // 'pending', 'accepted', 'blocked'
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Send friend request
  static async sendRequest(userId, friendId) {
    try {
      // Check if request already exists
      const existing = await database.get(
        `
        SELECT * FROM friends 
        WHERE (user_id = ? AND friend_id = ?) 
        OR (user_id = ? AND friend_id = ?)
      `,
        [userId, friendId, friendId, userId],
      );

      if (existing) {
        throw new Error("Friend request already exists");
      }

      const result = await database.run(
        `
        INSERT INTO friends (user_id, friend_id, status)
        VALUES (?, ?, 'pending')
      `,
        [userId, friendId],
      );

      return result.lastID;
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw error;
    }
  }

  // Accept friend request
  static async acceptRequest(requestId, userId) {
    try {
      await database.run(
        `
        UPDATE friends 
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND friend_id = ?
      `,
        [requestId, userId],
      );

      return true;
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw error;
    }
  }

  // Reject/Remove friend
  static async remove(requestId, userId) {
    try {
      await database.run(
        `
        DELETE FROM friends 
        WHERE id = ? AND (user_id = ? OR friend_id = ?)
      `,
        [requestId, userId, userId],
      );

      return true;
    } catch (error) {
      console.error("Error removing friend:", error);
      throw error;
    }
  }

  // Get user's friends
  static async getFriends(userId) {
    try {
      const friends = await database.all(
        `
        SELECT 
          u.id, u.username, u.email, u.level, u.experience, 
          u.avatar, u.current_streak, u.last_activity_date,
          f.status, f.created_at as friendship_date
        FROM friends f
        JOIN users u ON (
          CASE 
            WHEN f.user_id = ? THEN u.id = f.friend_id
            ELSE u.id = f.user_id
          END
        )
        WHERE (f.user_id = ? OR f.friend_id = ?) 
        AND f.status = 'accepted'
        ORDER BY u.username
      `,
        [userId, userId, userId],
      );

      return friends.map((friend) => ({
        id: friend.id,
        username: friend.username,
        email: friend.email,
        level: friend.level,
        experience: friend.experience,
        avatar: friend.avatar,
        streak: friend.current_streak,
        lastActivity: friend.last_activity_date,
        status: this.getOnlineStatus(friend.last_activity_date),
        friendshipDate: friend.friendship_date,
      }));
    } catch (error) {
      console.error("Error getting friends:", error);
      throw error;
    }
  }

  // Get pending friend requests
  static async getPendingRequests(userId) {
    try {
      const requests = await database.all(
        `
        SELECT 
          f.id as request_id,
          u.id, u.username, u.email, u.level, u.avatar,
          f.created_at as sent_at
        FROM friends f
        JOIN users u ON u.id = f.user_id
        WHERE f.friend_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC
      `,
        [userId],
      );

      return requests.map((req) => ({
        id: req.request_id,
        userId: req.id,
        username: req.username,
        level: req.level,
        avatar: req.avatar,
        sentAt: req.sent_at,
      }));
    } catch (error) {
      console.error("Error getting pending requests:", error);
      throw error;
    }
  }

  // Search users for friends
  static async searchUsers(currentUserId, searchQuery) {
    try {
      const users = await database.all(
        `
        SELECT 
          u.id, u.username, u.email, u.level, u.avatar
        FROM users u
        WHERE u.id != ? 
        AND (u.username LIKE ? OR u.email LIKE ?)
        AND u.id NOT IN (
          SELECT CASE 
            WHEN user_id = ? THEN friend_id
            ELSE user_id
          END
          FROM friends
          WHERE (user_id = ? OR friend_id = ?)
          AND status IN ('accepted', 'pending')
        )
        LIMIT 20
      `,
        [
          currentUserId,
          `%${searchQuery}%`,
          `%${searchQuery}%`,
          currentUserId,
          currentUserId,
          currentUserId,
        ],
      );

      return users;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  // Get sent friend requests
  static async getSentRequests(userId) {
    try {
      const requests = await database.all(
        `
        SELECT 
          f.id as request_id,
          u.id, u.username, u.email, u.level, u.avatar,
          f.created_at as sent_at
        FROM friends f
        JOIN users u ON u.id = f.friend_id
        WHERE f.user_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC
      `,
        [userId],
      );

      return requests.map((req) => ({
        id: req.request_id,
        userId: req.id,
        username: req.username,
        level: req.level,
        avatar: req.avatar,
        sentAt: req.sent_at,
      }));
    } catch (error) {
      console.error("Error getting sent requests:", error);
      throw error;
    }
  }

  // Block user
  static async block(friendshipId, userId) {
    try {
      await database.run(
        `
        UPDATE friends 
        SET status = 'blocked', updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND (user_id = ? OR friend_id = ?)
      `,
        [friendshipId, userId, userId],
      );
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  }

  // Helper to determine online status
  static getOnlineStatus(lastActivityDate) {
    if (!lastActivityDate) return "offline";

    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    const diffMinutes = (now - lastActivity) / (1000 * 60);

    return diffMinutes < 5 ? "online" : "offline";
  }

  // Get mutual friends count
  static async getMutualFriendsCount(userId1, userId2) {
    try {
      const result = await database.get(
        `
        SELECT COUNT(*) as count
        FROM friends f1
        JOIN friends f2 ON (
          (f1.friend_id = f2.user_id OR f1.user_id = f2.user_id OR 
           f1.friend_id = f2.friend_id OR f1.user_id = f2.friend_id)
        )
        WHERE (f1.user_id = ? OR f1.friend_id = ?)
        AND (f2.user_id = ? OR f2.friend_id = ?)
        AND f1.status = 'accepted'
        AND f2.status = 'accepted'
        AND f1.id != f2.id
      `,
        [userId1, userId1, userId2, userId2],
      );

      return result.count || 0;
    } catch (error) {
      console.error("Error getting mutual friends:", error);
      return 0;
    }
  }
}

module.exports = Friend;
