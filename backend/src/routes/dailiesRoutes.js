const express = require("express");
const router = express.Router();
const Daily = require("../models/Daily");
const authenticateToken = require("../middleware/auth");

// Get all dailies for user
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("📥 GET /dailies - User ID:", req.user.id);

    const dailies = await Daily.findByUserId(req.user.id);

    console.log("✅ Found dailies:", dailies.length);

    res.json({
      success: true,
      dailies: dailies,
    });
  } catch (error) {
    console.error("❌ Error fetching dailies:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dailies",
    });
  }
});

// Create new daily
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("📥 POST /dailies - Request body:", req.body);
    console.log("📥 User ID:", req.user.id);

    const {
      title,
      description,
      priority,
      difficulty,
      category,
      due_date,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      console.log("❌ Validation failed: Missing title");
      return res.status(400).json({
        success: false,
        error: "Title is required",
      });
    }

    const dailyData = {
      user_id: req.user.id,
      title: title.trim(),
      description: description || "",
      priority: priority || "medium",
      difficulty: difficulty || "medium",
      category: category || "General",
      due_date: due_date,
      tags: tags || "[]",
    };

    console.log("📤 Creating daily with data:", dailyData);

    const dailyId = await Daily.create(dailyData);

    if (!dailyId) {
      throw new Error("Failed to create daily");
    }

    // Fetch the created daily
    const newDaily = await Daily.findById(dailyId);

    console.log("✅ Daily created successfully:", newDaily);

    res.status(201).json({
      success: true,
      message: "Daily task created successfully",
      daily: newDaily,
    });
  } catch (error) {
    console.error("❌ Error creating daily:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create daily: " + error.message,
    });
  }
});

// Complete daily
router.post("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const dailyId = parseInt(req.params.id);
    console.log(
      "📥 POST /dailies/:id/complete - Daily ID:",
      dailyId,
      "User ID:",
      req.user.id
    );

    // Check if daily belongs to user
    const daily = await Daily.findById(dailyId);
    if (!daily || daily.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: "Daily task not found",
      });
    }

    // Check if already completed today
    if (daily.is_completed_today) {
      return res.status(400).json({
        success: false,
        error: "Daily task already completed today",
      });
    }

    await Daily.markCompleted(dailyId, req.user.id);

    // Get updated daily
    const updatedDaily = await Daily.findById(dailyId);

    console.log("✅ Daily completed successfully:", updatedDaily);

    res.json({
      success: true,
      message: "Daily task completed successfully!",
      daily: updatedDaily,
      rewards: {
        experience: getDifficultyXP(daily.difficulty, daily.priority),
        coins: getDifficultyCoins(daily.difficulty, daily.priority),
      },
    });
  } catch (error) {
    console.error("❌ Error completing daily:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete daily",
    });
  }
});

// Delete daily
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const dailyId = parseInt(req.params.id);
    console.log(
      "📥 DELETE /dailies/:id - Daily ID:",
      dailyId,
      "User ID:",
      req.user.id
    );

    const daily = await Daily.findById(dailyId);
    if (!daily || daily.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: "Daily task not found",
      });
    }

    await daily.delete();

    console.log("✅ Daily deleted successfully");

    res.json({
      success: true,
      message: "Daily task deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting daily:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete daily",
    });
  }
});

// Helper functions
function getDifficultyXP(difficulty, priority) {
  let xp = 0;
  switch (difficulty) {
    case "easy":
      xp = 3;
      break;
    case "medium":
      xp = 6;
      break;
    case "hard":
      xp = 10;
      break;
    default:
      xp = 6;
  }

  // Priority bonus
  switch (priority) {
    case "medium":
      xp += 2;
      break;
    case "high":
      xp += 5;
      break;
  }

  return xp;
}

function getDifficultyCoins(difficulty, priority) {
  let coins = 0;
  switch (difficulty) {
    case "easy":
      coins = 1;
      break;
    case "medium":
      coins = 3;
      break;
    case "hard":
      coins = 5;
      break;
    default:
      coins = 3;
  }

  // Priority bonus
  switch (priority) {
    case "medium":
      coins += 1;
      break;
    case "high":
      coins += 2;
      break;
  }

  return coins;
}

module.exports = router;
