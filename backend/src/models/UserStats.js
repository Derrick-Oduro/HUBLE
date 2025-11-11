const database = require("../config/database");

class UserStats {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.level = data.level;
    this.experience = data.experience;
    this.health = data.health;
    this.coins_earned = data.coins_earned;
    this.gems_earned = data.gems_earned;
    this.current_streak = data.current_streak;
    this.longest_streak = data.longest_streak;
    this.total_tasks_completed = data.total_tasks_completed;
    this.focus_minutes = data.focus_minutes;
    this.focus_sessions = data.focus_sessions;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new user stats
  static async create(statsData) {
    try {
      console.log("🔄 Creating user stats in database:", statsData);

      const result = await database.run(
        `INSERT INTO user_stats (
          user_id, level, experience, health, coins_earned, gems_earned,
          current_streak, longest_streak, total_tasks_completed, focus_minutes, focus_sessions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          statsData.user_id,
          statsData.level || 1,
          statsData.experience || 0,
          statsData.health || 100,
          statsData.coins_earned || 0,
          statsData.gems_earned || 0,
          statsData.current_streak || 0,
          statsData.longest_streak || 0,
          statsData.total_tasks_completed || 0,
          statsData.focus_minutes || 0,
          statsData.focus_sessions || 0,
        ]
      );

      console.log("✅ User stats created with ID:", result.lastID);
      return result.lastID;
    } catch (error) {
      console.error("❌ Error creating user stats:", error);
      throw error;
    }
  }

  // Find stats by user ID
  static async findByUserId(userId) {
    try {
      console.log("🔍 Finding stats for user:", userId);

      const stats = await database.get(
        "SELECT * FROM user_stats WHERE user_id = ?",
        [userId]
      );

      if (!stats) {
        console.log("❌ No stats found for user:", userId);
        return null;
      }

      console.log("✅ Found user stats:", stats);
      return new UserStats(stats);
    } catch (error) {
      console.error("❌ Error finding user stats:", error);
      throw error;
    }
  }

  // Update or create stats
  static async updateOrCreate(userId, statsData) {
    try {
      const existingStats = await UserStats.findByUserId(userId);

      if (existingStats) {
        // Update existing
        console.log("🔄 Updating existing stats for user:", userId);
        await database.run(
          `UPDATE user_stats 
           SET level = ?, experience = ?, health = ?, coins_earned = ?, gems_earned = ?,
               current_streak = ?, longest_streak = ?, total_tasks_completed = ?,
               focus_minutes = ?, focus_sessions = ?, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [
            statsData.level,
            statsData.experience,
            statsData.health,
            statsData.coins_earned,
            statsData.gems_earned,
            statsData.current_streak,
            statsData.longest_streak,
            statsData.total_tasks_completed,
            statsData.focus_minutes,
            statsData.focus_sessions,
            userId,
          ]
        );
        console.log("✅ Stats updated for user:", userId);
      } else {
        // Create new
        console.log("🆕 Creating new stats for user:", userId);
        await UserStats.create(statsData);
      }

      return true;
    } catch (error) {
      console.error("❌ Error updating/creating user stats:", error);
      throw error;
    }
  }
}

module.exports = UserStats;
