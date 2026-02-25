const database = require("../config/database");

class Challenge {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.emoji = data.emoji;
    this.color = data.color;
    this.difficulty = data.difficulty; // 'Easy', 'Medium', 'Hard'
    this.reward = data.reward;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.goal_value = data.goal_value;
    this.goal_type = data.goal_type; // 'count', 'duration', 'streak'
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create challenge
  static async create(challengeData) {
    try {
      const {
        title,
        description,
        emoji,
        color,
        difficulty,
        reward,
        start_date,
        end_date,
        goal_value,
        goal_type,
      } = challengeData;

      const result = await database.run(
        `
        INSERT INTO challenges (
          title, description, emoji, color, difficulty,
          reward, start_date, end_date, goal_value, goal_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          title,
          description,
          emoji || "🏆",
          color || "#8B5CF6",
          difficulty || "Medium",
          reward,
          start_date,
          end_date,
          goal_value,
          goal_type || "count",
        ],
      );

      return result.lastID;
    } catch (error) {
      console.error("Error creating challenge:", error);
      throw error;
    }
  }

  // Get all active challenges
  static async getActive() {
    try {
      const now = new Date().toISOString();
      const challenges = await database.all(
        `
        SELECT c.*,
               COUNT(DISTINCT cp.user_id) as participant_count
        FROM challenges c
        LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
        WHERE c.start_date <= ? AND c.end_date >= ?
        GROUP BY c.id
        ORDER BY c.start_date DESC
      `,
        [now, now],
      );

      return challenges;
    } catch (error) {
      console.error("Error getting active challenges:", error);
      throw error;
    }
  }

  // Get challenge by ID
  static async getById(challengeId) {
    try {
      const challenge = await database.get(
        `
        SELECT c.*,
               COUNT(DISTINCT cp.user_id) as participant_count
        FROM challenges c
        LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
        WHERE c.id = ?
        GROUP BY c.id
      `,
        [challengeId],
      );

      return challenge;
    } catch (error) {
      console.error("Error getting challenge by ID:", error);
      throw error;
    }
  }

  // Get upcoming challenges
  static async getUpcoming() {
    try {
      const now = new Date().toISOString();
      const challenges = await database.all(
        `
        SELECT c.*,
               COUNT(DISTINCT cp.user_id) as participant_count
        FROM challenges c
        LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
        WHERE c.start_date > ?
        GROUP BY c.id
        ORDER BY c.start_date ASC
      `,
        [now],
      );

      return challenges;
    } catch (error) {
      console.error("Error getting upcoming challenges:", error);
      throw error;
    }
  }

  // Get user's active challenges
  static async getUserChallenges(userId) {
    try {
      const now = new Date().toISOString();
      const challenges = await database.all(
        `
        SELECT c.*,
               cp.progress,
               cp.joined_at,
               COUNT(DISTINCT cp2.user_id) as participant_count,
               (
                 SELECT COUNT(*) + 1
                 FROM challenge_participants cp_rank
                 WHERE cp_rank.challenge_id = c.id
                 AND cp_rank.progress > cp.progress
               ) as user_rank
        FROM challenges c
        JOIN challenge_participants cp ON c.id = cp.challenge_id AND cp.user_id = ?
        LEFT JOIN challenge_participants cp2 ON c.id = cp2.challenge_id
        WHERE c.start_date <= ? AND c.end_date >= ?
        GROUP BY c.id
        ORDER BY c.end_date ASC
      `,
        [userId, now, now],
      );

      return challenges;
    } catch (error) {
      console.error("Error getting user challenges:", error);
      throw error;
    }
  }

  // Get user's completed challenges
  static async getUserCompletedChallenges(userId) {
    try {
      const now = new Date().toISOString();
      const challenges = await database.all(
        `
        SELECT c.*,
               cp.progress,
               cp.completed_at,
               COUNT(DISTINCT cp2.user_id) as participant_count,
               (
                 SELECT COUNT(*) + 1
                 FROM challenge_participants cp_rank
                 WHERE cp_rank.challenge_id = c.id
                 AND cp_rank.progress > cp.progress
               ) as final_rank
        FROM challenges c
        JOIN challenge_participants cp ON c.id = cp.challenge_id AND cp.user_id = ?
        LEFT JOIN challenge_participants cp2 ON c.id = cp2.challenge_id
        WHERE c.end_date < ? OR cp.progress >= c.goal_value
        GROUP BY c.id
        ORDER BY cp.completed_at DESC
      `,
        [userId, now],
      );

      return challenges;
    } catch (error) {
      console.error("Error getting completed challenges:", error);
      throw error;
    }
  }

  // Join challenge
  static async join(challengeId, userId) {
    try {
      // Check if already joined
      const existing = await database.get(
        `
        SELECT * FROM challenge_participants
        WHERE challenge_id = ? AND user_id = ?
      `,
        [challengeId, userId],
      );

      if (existing) {
        throw new Error("Already joined this challenge");
      }

      await database.run(
        `
        INSERT INTO challenge_participants (challenge_id, user_id, progress)
        VALUES (?, ?, 0)
      `,
        [challengeId, userId],
      );

      return true;
    } catch (error) {
      console.error("Error joining challenge:", error);
      throw error;
    }
  }

  // Update user's challenge progress
  static async updateProgress(challengeId, userId, progress) {
    try {
      const challenge = await database.get(
        "SELECT * FROM challenges WHERE id = ?",
        [challengeId],
      );

      const isCompleted = progress >= challenge.goal_value;

      await database.run(
        `
        UPDATE challenge_participants
        SET progress = ?,
            completed_at = ${isCompleted ? "CURRENT_TIMESTAMP" : "NULL"},
            updated_at = CURRENT_TIMESTAMP
        WHERE challenge_id = ? AND user_id = ?
      `,
        [progress, challengeId, userId],
      );

      return true;
    } catch (error) {
      console.error("Error updating challenge progress:", error);
      throw error;
    }
  }

  // Get leaderboard for a challenge
  static async getLeaderboard(challengeId, limit = 50) {
    try {
      const leaderboard = await database.all(
        `
        SELECT u.id, u.username, u.avatar, u.level,
               cp.progress,
               ROW_NUMBER() OVER (ORDER BY cp.progress DESC) as rank
        FROM challenge_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.challenge_id = ?
        ORDER BY cp.progress DESC
        LIMIT ?
      `,
        [challengeId, limit],
      );

      return leaderboard;
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      throw error;
    }
  }

  // Leave challenge
  static async leave(challengeId, userId) {
    try {
      await database.run(
        `
        DELETE FROM challenge_participants
        WHERE challenge_id = ? AND user_id = ?
      `,
        [challengeId, userId],
      );

      return true;
    } catch (error) {
      console.error("Error leaving challenge:", error);
      throw error;
    }
  }

  // Calculate time remaining
  static getTimeRemaining(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 7) return `${Math.floor(days / 7)} weeks`;
    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  }
}

module.exports = Challenge;
