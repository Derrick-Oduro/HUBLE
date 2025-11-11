const express = require("express");
const router = express.Router();
const UserStats = require("../models/UserStats");
const authenticateToken = require("../middleware/auth");

// Get user stats
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("📥 GET /stats - User ID:", req.user.id);

    let stats = await UserStats.findByUserId(req.user.id);

    // If no stats exist, create default level 1 stats
    if (!stats) {
      console.log("🆕 Creating default stats for new user");
      const defaultStats = {
        user_id: req.user.id,
        level: 1,
        experience: 0,
        health: 100,
        coins_earned: 0,
        gems_earned: 0,
        current_streak: 0,
        longest_streak: 0,
        total_tasks_completed: 0,
        focus_minutes: 0,
        focus_sessions: 0,
      };

      await UserStats.create(defaultStats);
      stats = await UserStats.findByUserId(req.user.id);
    }

    console.log("✅ User stats retrieved:", stats);

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("❌ Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user stats",
    });
  }
});

// Update user stats
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("📥 POST /stats - User ID:", req.user.id);
    console.log("📥 Stats data:", req.body);

    const {
      level,
      experience,
      health,
      coins_earned,
      gems_earned,
      current_streak,
      longest_streak,
      total_tasks_completed,
      focus_minutes,
      focus_sessions,
    } = req.body;

    const statsData = {
      user_id: req.user.id,
      level: level || 1,
      experience: experience || 0,
      health: health || 100,
      coins_earned: coins_earned || 0,
      gems_earned: gems_earned || 0,
      current_streak: current_streak || 0,
      longest_streak: longest_streak || 0,
      total_tasks_completed: total_tasks_completed || 0,
      focus_minutes: focus_minutes || 0,
      focus_sessions: focus_sessions || 0,
    };

    await UserStats.updateOrCreate(req.user.id, statsData);

    console.log("✅ User stats updated successfully");

    res.json({
      success: true,
      message: "User stats updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating user stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user stats",
    });
  }
});

// Reset user stats to level 1 (for testing)
router.post("/reset", authenticateToken, async (req, res) => {
  try {
    console.log("🔄 Resetting stats for user:", req.user.id);

    const defaultStats = {
      user_id: req.user.id,
      level: 1,
      experience: 0,
      health: 100,
      coins_earned: 0,
      gems_earned: 0,
      current_streak: 0,
      longest_streak: 0,
      total_tasks_completed: 0,
      focus_minutes: 0,
      focus_sessions: 0,
    };

    await UserStats.updateOrCreate(req.user.id, defaultStats);

    console.log("✅ User stats reset to level 1");

    res.json({
      success: true,
      message: "User stats reset to level 1 successfully",
    });
  } catch (error) {
    console.error("❌ Error resetting user stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset user stats",
    });
  }
});

module.exports = router;
