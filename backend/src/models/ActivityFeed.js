const db = require("../config/database");

class ActivityFeed {
  static mapActivityRow(activity) {
    return {
      ...activity,
      metadata: JSON.parse(activity.metadata || "{}"),
      cheers_count: Number(activity.cheers_count || 0),
      has_cheered: Boolean(activity.has_cheered),
    };
  }

  // Log activity
  static async logActivity(userId, activityData) {
    try {
      const { type, title, description, icon, color, metadata } = activityData;

      await db.run(
        `
        INSERT INTO activity_feed (user_id, activity_type, title, description, icon, color, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          userId,
          type,
          title,
          description || null,
          icon || null,
          color || null,
          JSON.stringify(metadata || {}),
        ],
      );

      return true;
    } catch (error) {
      console.error("Error logging activity:", error);
      throw error;
    }
  }

  static async getActivityById(activityId) {
    return db.get(
      `
      SELECT * FROM activity_feed
      WHERE id = ?
    `,
      [activityId],
    );
  }

  static async cheerActivity(activityId, userId) {
    await db.run(
      `
      INSERT OR IGNORE INTO activity_cheers (activity_id, user_id)
      VALUES (?, ?)
    `,
      [activityId, userId],
    );
  }

  static async uncheerActivity(activityId, userId) {
    await db.run(
      `
      DELETE FROM activity_cheers
      WHERE activity_id = ? AND user_id = ?
    `,
      [activityId, userId],
    );
  }

  static async getCheerSummary(activityId, userId) {
    const summary = await db.get(
      `
      SELECT
        COALESCE((SELECT COUNT(*) FROM activity_cheers ac WHERE ac.activity_id = ?), 0) AS cheers_count,
        EXISTS(
          SELECT 1 FROM activity_cheers ac
          WHERE ac.activity_id = ? AND ac.user_id = ?
        ) AS has_cheered
    `,
      [activityId, activityId, userId],
    );

    return {
      cheersCount: Number(summary?.cheers_count || 0),
      hasCheered: Boolean(summary?.has_cheered),
    };
  }

  // Get user's activity feed
  static async getUserActivities(userId, limit = 50) {
    try {
      const activities = await db.all(
        `
        SELECT
          af.*,
          COALESCE((SELECT COUNT(*) FROM activity_cheers ac WHERE ac.activity_id = af.id), 0) AS cheers_count,
          EXISTS(
            SELECT 1 FROM activity_cheers ac
            WHERE ac.activity_id = af.id AND ac.user_id = ?
          ) AS has_cheered
        FROM activity_feed af
        WHERE af.user_id = ?
        ORDER BY af.created_at DESC
        LIMIT ?
      `,
        [userId, userId, limit],
      );

      return activities.map((activity) =>
        ActivityFeed.mapActivityRow(activity),
      );
    } catch (error) {
      console.error("Error fetching user activities:", error);
      throw error;
    }
  }

  // Get friends' activities for social feed
  static async getFriendsActivities(userId, limit = 50) {
    try {
      const activities = await db.all(
        `
        SELECT 
          af.*,
          u.username,
          u.avatar,
          COALESCE((SELECT COUNT(*) FROM activity_cheers ac WHERE ac.activity_id = af.id), 0) AS cheers_count,
          EXISTS(
            SELECT 1 FROM activity_cheers ac
            WHERE ac.activity_id = af.id AND ac.user_id = ?
          ) AS has_cheered
        FROM activity_feed af
        INNER JOIN users u ON af.user_id = u.id
        INNER JOIN friends f ON (
          (f.user_id = ? AND f.friend_id = af.user_id) OR 
          (f.friend_id = ? AND f.user_id = af.user_id)
        )
        WHERE f.status = 'accepted'
        AND af.activity_type IN ('habit_completed', 'level_up', 'achievement_unlocked', 'challenge_completed')
        ORDER BY af.created_at DESC
        LIMIT ?
      `,
        [userId, userId, userId, limit],
      );

      return activities.map((activity) =>
        ActivityFeed.mapActivityRow(activity),
      );
    } catch (error) {
      console.error("Error fetching friends activities:", error);
      throw error;
    }
  }

  // Get party activities
  static async getPartyActivities(partyId, viewerUserId, limit = 50) {
    try {
      const activities = await db.all(
        `
        SELECT 
          af.*,
          u.username,
          u.avatar,
          COALESCE((SELECT COUNT(*) FROM activity_cheers ac WHERE ac.activity_id = af.id), 0) AS cheers_count,
          EXISTS(
            SELECT 1 FROM activity_cheers ac
            WHERE ac.activity_id = af.id AND ac.user_id = ?
          ) AS has_cheered
        FROM activity_feed af
        INNER JOIN users u ON af.user_id = u.id
        INNER JOIN party_members pm ON pm.user_id = af.user_id
        WHERE pm.party_id = ?
        ORDER BY af.created_at DESC
        LIMIT ?
      `,
        [viewerUserId, partyId, limit],
      );

      return activities.map((activity) =>
        ActivityFeed.mapActivityRow(activity),
      );
    } catch (error) {
      console.error("Error fetching party activities:", error);
      throw error;
    }
  }

  // Delete old activities (cleanup)
  static async cleanupOldActivities(daysToKeep = 90) {
    try {
      await db.run(`
        DELETE FROM activity_feed
        WHERE created_at < datetime('now', '-${daysToKeep} days')
      `);
      return true;
    } catch (error) {
      console.error("Error cleaning up old activities:", error);
      throw error;
    }
  }
}

module.exports = ActivityFeed;
