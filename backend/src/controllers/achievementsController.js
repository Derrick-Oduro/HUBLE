const Achievement = require("../models/Achievement");
const UserStats = require("../models/UserStats");

// Get all achievements with user's progress
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievements = await Achievement.getUserProgress(userId);

    // Group by category
    const grouped = achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        color: achievement.color,
        progress: achievement.progress,
        total: achievement.requirement_value,
        unlocked: achievement.unlocked === 1,
        unlockedAt: achievement.unlocked_at,
        xpReward: achievement.xp_reward,
        coinReward: achievement.coin_reward,
        unlockLevel: achievement.unlock_level,
      });
      return acc;
    }, {});

    const stats = await Achievement.getStats(userId);

    res.json({
      success: true,
      achievements: grouped,
      stats,
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get achievements",
      error: error.message,
    });
  }
};

// Check and unlock achievements (called after user actions)
exports.checkAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const unlocked = await Achievement.checkAndUnlock(userId);

    // Award XP and coins for newly unlocked achievements
    if (unlocked.length > 0) {
      const totalXP = unlocked.reduce((sum, a) => sum + a.xp_reward, 0);
      const totalCoins = unlocked.reduce((sum, a) => sum + a.coin_reward, 0);

      if (totalXP > 0 || totalCoins > 0) {
        await UserStats.updateExperience(userId, totalXP);
        await UserStats.updateCoins(userId, totalCoins);
      }
    }

    res.json({
      success: true,
      unlocked: unlocked.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        xpReward: a.xp_reward,
        coinReward: a.coin_reward,
      })),
      totalXP: unlocked.reduce((sum, a) => sum + a.xp_reward, 0),
      totalCoins: unlocked.reduce((sum, a) => sum + a.coin_reward, 0),
    });
  } catch (error) {
    console.error("Check achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check achievements",
      error: error.message,
    });
  }
};

// Get achievement statistics
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Achievement.getStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get achievement stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get achievement statistics",
      error: error.message,
    });
  }
};

// Get unlocked achievements
exports.getUnlocked = async (req, res) => {
  try {
    const userId = req.user.id;
    const unlocked = await Achievement.getUnlocked(userId);

    res.json({
      success: true,
      achievements: unlocked,
    });
  } catch (error) {
    console.error("Get unlocked achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unlocked achievements",
      error: error.message,
    });
  }
};

// Seed default achievements (admin only)
exports.seedAchievements = async (req, res) => {
  try {
    await Achievement.seedDefaults();

    res.json({
      success: true,
      message: "Default achievements seeded successfully",
    });
  } catch (error) {
    console.error("Seed achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed achievements",
      error: error.message,
    });
  }
};
