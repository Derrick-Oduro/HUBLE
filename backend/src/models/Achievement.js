const db = require("../config/database");

class Achievement {
  // Create achievements table
  static async createTable() {
    const achievementsQuery = `
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        requirement_type TEXT NOT NULL,
        requirement_value INTEGER NOT NULL,
        xp_reward INTEGER DEFAULT 0,
        coin_reward INTEGER DEFAULT 0,
        unlock_level INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const progressQuery = `
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id INTEGER NOT NULL,
        progress INTEGER DEFAULT 0,
        unlocked BOOLEAN DEFAULT 0,
        unlocked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        UNIQUE(user_id, achievement_id)
      )
    `;

    await db.run(achievementsQuery);
    await db.run(progressQuery);
  }

  // Seed default achievements
  static async seedDefaults() {
    const achievements = [
      // Habit Master Category
      {
        category: "habits",
        title: "First Steps",
        description: "Complete your first habit",
        icon: "checkmark-circle",
        color: "#10B981",
        requirement_type: "habit_completions",
        requirement_value: 1,
        xp_reward: 10,
        coin_reward: 5,
        unlock_level: 1,
      },
      {
        category: "habits",
        title: "Week Warrior",
        description: "Complete habits for 7 days straight",
        icon: "checkmark-circle",
        color: "#10B981",
        requirement_type: "habit_streak",
        requirement_value: 7,
        xp_reward: 50,
        coin_reward: 25,
        unlock_level: 1,
      },
      {
        category: "habits",
        title: "Month Champion",
        description: "Complete habits for 30 days",
        icon: "checkmark-circle",
        color: "#10B981",
        requirement_type: "habit_streak",
        requirement_value: 30,
        xp_reward: 200,
        coin_reward: 100,
        unlock_level: 1,
      },
      {
        category: "habits",
        title: "Habit Legend",
        description: "Complete habits for 100 days",
        icon: "checkmark-circle",
        color: "#10B981",
        requirement_type: "habit_streak",
        requirement_value: 100,
        xp_reward: 1000,
        coin_reward: 500,
        unlock_level: 1,
      },

      // Focus Expert Category
      {
        category: "focus",
        title: "Focused Mind",
        description: "Complete 10 focus sessions",
        icon: "timer",
        color: "#F59E0B",
        requirement_type: "focus_sessions",
        requirement_value: 10,
        xp_reward: 50,
        coin_reward: 25,
        unlock_level: 1,
      },
      {
        category: "focus",
        title: "Deep Worker",
        description: "Focus for 5 hours in a day",
        icon: "timer",
        color: "#F59E0B",
        requirement_type: "daily_focus_minutes",
        requirement_value: 300,
        xp_reward: 100,
        coin_reward: 50,
        unlock_level: 5,
      },
      {
        category: "focus",
        title: "Concentration King",
        description: "Complete 100 focus sessions",
        icon: "timer",
        color: "#F59E0B",
        requirement_type: "focus_sessions",
        requirement_value: 100,
        xp_reward: 500,
        coin_reward: 250,
        unlock_level: 10,
      },

      // Level Master Category
      {
        category: "level",
        title: "Level Up!",
        description: "Reach level 5",
        icon: "trending-up",
        color: "#8B5CF6",
        requirement_type: "level",
        requirement_value: 5,
        xp_reward: 100,
        coin_reward: 50,
        unlock_level: 5,
      },
      {
        category: "level",
        title: "XP Hunter",
        description: "Earn 1000 XP",
        icon: "trending-up",
        color: "#8B5CF6",
        requirement_type: "total_xp",
        requirement_value: 1000,
        xp_reward: 200,
        coin_reward: 100,
        unlock_level: 1,
      },
      {
        category: "level",
        title: "Elite Status",
        description: "Reach level 20",
        icon: "trending-up",
        color: "#8B5CF6",
        requirement_type: "level",
        requirement_value: 20,
        xp_reward: 500,
        coin_reward: 250,
        unlock_level: 20,
      },

      // Daily Tasks Category
      {
        category: "dailies",
        title: "Daily Dedication",
        description: "Complete 10 daily tasks",
        icon: "calendar",
        color: "#3B82F6",
        requirement_type: "daily_completions",
        requirement_value: 10,
        xp_reward: 50,
        coin_reward: 25,
        unlock_level: 1,
      },
      {
        category: "dailies",
        title: "Task Master",
        description: "Complete 50 daily tasks",
        icon: "calendar",
        color: "#3B82F6",
        requirement_type: "daily_completions",
        requirement_value: 50,
        xp_reward: 200,
        coin_reward: 100,
        unlock_level: 5,
      },

      // Routine Category
      {
        category: "routines",
        title: "Routine Builder",
        description: "Create your first routine",
        icon: "list",
        color: "#EC4899",
        requirement_type: "routines_created",
        requirement_value: 1,
        xp_reward: 25,
        coin_reward: 10,
        unlock_level: 1,
      },
      {
        category: "routines",
        title: "Routine Master",
        description: "Complete 20 routines",
        icon: "list",
        color: "#EC4899",
        requirement_type: "routine_completions",
        requirement_value: 20,
        xp_reward: 150,
        coin_reward: 75,
        unlock_level: 5,
      },

      // Social Category
      {
        category: "social",
        title: "Social Butterfly",
        description: "Add 5 friends",
        icon: "people",
        color: "#14B8A6",
        requirement_type: "friend_count",
        requirement_value: 5,
        xp_reward: 50,
        coin_reward: 25,
        unlock_level: 1,
      },
      {
        category: "social",
        title: "Party Animal",
        description: "Join 3 parties",
        icon: "people-circle",
        color: "#14B8A6",
        requirement_type: "party_count",
        requirement_value: 3,
        xp_reward: 75,
        coin_reward: 40,
        unlock_level: 5,
      },
      {
        category: "social",
        title: "Champion",
        description: "Win a challenge",
        icon: "trophy",
        color: "#14B8A6",
        requirement_type: "challenges_won",
        requirement_value: 1,
        xp_reward: 200,
        coin_reward: 100,
        unlock_level: 10,
      },
    ];

    for (const achievement of achievements) {
      try {
        await db.run(
          `
          INSERT OR IGNORE INTO achievements (category, title, description, icon, color, requirement_type, requirement_value, xp_reward, coin_reward, unlock_level)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            achievement.category,
            achievement.title,
            achievement.description,
            achievement.icon,
            achievement.color,
            achievement.requirement_type,
            achievement.requirement_value,
            achievement.xp_reward,
            achievement.coin_reward,
            achievement.unlock_level,
          ],
        );
      } catch (error) {
        console.error("Error seeding achievement:", achievement.title, error);
      }
    }
  }

  // Get all achievements
  static async getAll() {
    return db.all(
      "SELECT * FROM achievements ORDER BY category, requirement_value",
    );
  }

  // Get user's achievement progress
  static async getUserProgress(userId) {
    const query = `
      SELECT 
        a.*,
        COALESCE(ua.progress, 0) as progress,
        COALESCE(ua.unlocked, 0) as unlocked,
        ua.unlocked_at
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      ORDER BY a.category, a.requirement_value
    `;
    return db.all(query, [userId]);
  }

  // Update user progress for an achievement
  static async updateProgress(userId, achievementId, progress) {
    const query = `
      INSERT INTO user_achievements (user_id, achievement_id, progress, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, achievement_id) 
      DO UPDATE SET progress = ?, updated_at = CURRENT_TIMESTAMP
    `;
    return db.run(query, [userId, achievementId, progress, progress]);
  }

  // Unlock achievement
  static async unlock(userId, achievementId) {
    const query = `
      INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked, unlocked_at, updated_at)
      VALUES (?, ?, (SELECT requirement_value FROM achievements WHERE id = ?), 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, achievement_id) 
      DO UPDATE SET unlocked = 1, unlocked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    `;
    return db.run(query, [userId, achievementId, achievementId]);
  }

  // Check and unlock achievements based on user stats
  static async checkAndUnlock(userId) {
    const achievements = await this.getUserProgress(userId);
    const userStats = await db.get(
      "SELECT * FROM user_stats WHERE user_id = ?",
      [userId],
    );

    if (!userStats) return [];

    const unlocked = [];

    for (const achievement of achievements) {
      if (achievement.unlocked) continue; // Already unlocked

      let currentProgress = 0;

      // Calculate progress based on requirement type
      switch (achievement.requirement_type) {
        case "habit_completions":
          currentProgress = userStats.total_habits_completed || 0;
          break;
        case "habit_streak":
          currentProgress = userStats.current_habit_streak || 0;
          break;
        case "focus_sessions":
          currentProgress = userStats.focus_sessions_today || 0;
          break;
        case "daily_focus_minutes":
          currentProgress = userStats.minutes_focused_today || 0;
          break;
        case "level":
          currentProgress = userStats.level || 1;
          break;
        case "total_xp":
          currentProgress = userStats.experience || 0;
          break;
        case "daily_completions":
          currentProgress = userStats.dailies_completed || 0;
          break;
        case "routine_completions":
          currentProgress = userStats.routines_completed || 0;
          break;
        case "routines_created":
          // Need to count from routines table
          const routineCount = await db.get(
            "SELECT COUNT(*) as count FROM routines WHERE user_id = ?",
            [userId],
          );
          currentProgress = routineCount?.count || 0;
          break;
        case "friend_count":
          const friendCount = await db.get(
            'SELECT COUNT(*) as count FROM friends WHERE (user_id = ? OR friend_id = ?) AND status = "accepted"',
            [userId, userId],
          );
          currentProgress = friendCount?.count || 0;
          break;
        case "party_count":
          const partyCount = await db.get(
            "SELECT COUNT(*) as count FROM party_members WHERE user_id = ?",
            [userId],
          );
          currentProgress = partyCount?.count || 0;
          break;
        case "challenges_won":
          // Would need to track challenge winners
          currentProgress = 0;
          break;
      }

      // Update progress
      await this.updateProgress(userId, achievement.id, currentProgress);

      // Check if should unlock
      if (
        currentProgress >= achievement.requirement_value &&
        userStats.level >= achievement.unlock_level
      ) {
        await this.unlock(userId, achievement.id);
        unlocked.push(achievement);
      }
    }

    return unlocked;
  }

  // Get unlocked achievements for user
  static async getUnlocked(userId) {
    const query = `
      SELECT a.*, ua.unlocked_at
      FROM achievements a
      INNER JOIN user_achievements ua ON a.id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.unlocked = 1
      ORDER BY ua.unlocked_at DESC
    `;
    return db.all(query, [userId]);
  }

  // Get achievement statistics for user
  static async getStats(userId) {
    const totalQuery = "SELECT COUNT(*) as total FROM achievements";
    const unlockedQuery =
      "SELECT COUNT(*) as unlocked FROM user_achievements WHERE user_id = ? AND unlocked = 1";

    const total = await db.get(totalQuery);
    const unlocked = await db.get(unlockedQuery, [userId]);

    return {
      total: total.total || 0,
      unlocked: unlocked.unlocked || 0,
      percentage:
        total.total > 0
          ? Math.round((unlocked.unlocked / total.total) * 100)
          : 0,
    };
  }
}

module.exports = Achievement;
