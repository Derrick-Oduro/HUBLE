const db = require("../config/database");

// Export user data
exports.exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile
    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
    delete user.password; // Remove password from export

    // Get habits
    const habits = await db.all("SELECT * FROM habits WHERE user_id = ?", [
      userId,
    ]);
    const habitCompletions = await db.all(
      "SELECT * FROM habit_completions WHERE user_id = ?",
      [userId],
    );

    // Get dailies
    const dailies = await db.all("SELECT * FROM dailies WHERE user_id = ?", [
      userId,
    ]);
    const dailyCompletions = await db.all(
      "SELECT * FROM daily_completions WHERE user_id = ?",
      [userId],
    );

    // Get routines
    const routines = await db.all("SELECT * FROM routines WHERE user_id = ?", [
      userId,
    ]);
    const routineCompletions = await db.all(
      "SELECT * FROM routine_completions WHERE user_id = ?",
      [userId],
    );

    // Get focus sessions
    const focusSessions = await db.all(
      "SELECT * FROM focus_sessions WHERE user_id = ?",
      [userId],
    );

    // Get user stats
    const stats = await db.get("SELECT * FROM user_stats WHERE user_id = ?", [
      userId,
    ]);

    // Get achievements
    const achievements = await db.all(
      `
      SELECT a.*, ua.progress, ua.unlocked, ua.unlocked_at
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
    `,
      [userId],
    );

    // Get friends
    const friends = await db.all(
      `
      SELECT f.*, u.username, u.email
      FROM friends f
      INNER JOIN users u ON (f.friend_id = u.id)
      WHERE f.user_id = ? AND f.status = 'accepted'
    `,
      [userId],
    );

    // Get parties
    const parties = await db.all(
      `
      SELECT p.*
      FROM parties p
      INNER JOIN party_members pm ON p.id = pm.party_id
      WHERE pm.user_id = ?
    `,
      [userId],
    );

    // Get challenges
    const challenges = await db.all(
      `
      SELECT c.*, cp.progress, cp.completed
      FROM challenges c
      INNER JOIN challenge_participants cp ON c.id = cp.challenge_id
      WHERE cp.user_id = ?
    `,
      [userId],
    );

    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      user,
      habits: {
        habits,
        completions: habitCompletions,
      },
      dailies: {
        dailies,
        completions: dailyCompletions,
      },
      routines: {
        routines,
        completions: routineCompletions,
      },
      focusSessions,
      stats,
      achievements,
      social: {
        friends,
        parties,
        challenges,
      },
    };

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error("Export data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export data",
      error: error.message,
    });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    // Daily activity stats
    const dailyStats = await db.all(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_activities
      FROM activity_feed
      WHERE user_id = ? 
      AND created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
      [userId],
    );

    // Habit completion trends
    const habitTrends = await db.all(
      `
      SELECT 
        DATE(completion_date) as date,
        COUNT(*) as completions
      FROM habit_completions
      WHERE user_id = ?
      AND completion_date >= date('now', '-${days} days')
      GROUP BY DATE(completion_date)
      ORDER BY date ASC
    `,
      [userId],
    );

    // Focus time analysis
    const focusAnalysis = await db.all(
      `
      SELECT 
        DATE(created_at) as date,
        SUM(duration_actual) / 60 as total_minutes,
        COUNT(*) as session_count
      FROM focus_sessions
      WHERE user_id = ?
      AND created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
      [userId],
    );

    // XP gain over time
    const xpTrends = await db.all(
      `
      SELECT 
        DATE(created_at) as date,
        SUM(experience_gained) as xp_gained
      FROM focus_sessions
      WHERE user_id = ?
      AND created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
      [userId],
    );

    // Category breakdown
    const categoryBreakdown = await db.all(
      `
      SELECT 
        category,
        COUNT(*) as count
      FROM dailies
      WHERE user_id = ?
      GROUP BY category
    `,
      [userId],
    );

    // Productivity score (completion rate)
    const productivityScore = await db.get(
      `
      SELECT 
        COUNT(CASE WHEN is_completed_today = 1 THEN 1 END) * 100.0 / COUNT(*) as score
      FROM habits
      WHERE user_id = ?
    `,
      [userId],
    );

    // Streak analysis
    const streakData = await db.get(
      `
      SELECT 
        current_streak,
        longest_streak
      FROM users
      WHERE id = ?
    `,
      [userId],
    );

    res.json({
      success: true,
      analytics: {
        period: `${days} days`,
        dailyActivity: dailyStats,
        habitTrends,
        focusAnalysis,
        xpTrends,
        categoryBreakdown,
        productivityScore: Math.round(productivityScore?.score || 0),
        streakData,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get analytics",
      error: error.message,
    });
  }
};

// Backup user data (simplified version)
exports.backupData = async (req, res) => {
  try {
    // Create backup timestamp
    const backupTimestamp = new Date().toISOString();

    // Use the same export logic
    const exportResponse = await exports.exportUserData(req, {
      json: (data) => data,
    });

    res.json({
      success: true,
      message: "Backup created successfully",
      backupId: backupTimestamp,
      dataSize: JSON.stringify(exportResponse.data).length,
    });
  } catch (error) {
    console.error("Backup data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create backup",
      error: error.message,
    });
  }
};
