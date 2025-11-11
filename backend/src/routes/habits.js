const express = require("express");
const router = express.Router();
const Habit = require("../models/Habit");
const authenticateToken = require("../middleware/auth");

// Get all habits for user
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("📥 GET /habits - User ID:", req.user.id);

    const habits = await Habit.findByUserId(req.user.id);

    console.log("✅ Found habits:", habits.length);

    res.json({
      success: true,
      habits: habits,
    });
  } catch (error) {
    console.error("❌ Error fetching habits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch habits",
    });
  }
});

// Create new habit
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("📥 POST /habits - Request body:", req.body);
    console.log("📥 User ID:", req.user.id);

    const { title, description, difficulty, color, target_days } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      console.log("❌ Validation failed: Missing title");
      return res.status(400).json({
        success: false,
        error: "Title is required",
      });
    }

    const habitData = {
      user_id: req.user.id,
      title: title.trim(),
      description: description || "",
      difficulty: difficulty || "medium",
      color: color || "#3B82F6",
      target_days: target_days || [1, 2, 3, 4, 5, 6, 0],
    };

    console.log("📤 Creating habit with data:", habitData);

    const habitId = await Habit.create(habitData);

    if (!habitId) {
      throw new Error("Failed to create habit");
    }

    // Fetch the created habit
    const newHabit = await Habit.findById(habitId);

    console.log("✅ Habit created successfully:", newHabit);

    res.status(201).json({
      success: true,
      message: "Habit created successfully",
      habit: newHabit,
    });
  } catch (error) {
    console.error("❌ Error creating habit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create habit: " + error.message,
    });
  }
});

// Complete habit
router.post("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    console.log(
      "📥 POST /habits/:id/complete - Habit ID:",
      habitId,
      "User ID:",
      req.user.id
    );

    // Check if habit belongs to user
    const habit = await Habit.findById(habitId);
    if (!habit || habit.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: "Habit not found",
      });
    }

    // Check if already completed today
    if (habit.is_completed_today) {
      return res.status(400).json({
        success: false,
        error: "Habit already completed today",
      });
    }

    await Habit.markCompleted(habitId, req.user.id);

    // Get updated habit with new streak
    const updatedHabit = await Habit.findById(habitId);

    console.log("✅ Habit completed successfully:", updatedHabit);

    res.json({
      success: true,
      message: "Habit completed successfully!",
      habit: updatedHabit,
      rewards: {
        experience: getDifficultyXP(habit.difficulty),
        coins: getDifficultyCoins(habit.difficulty),
      },
    });
  } catch (error) {
    console.error("❌ Error completing habit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete habit",
    });
  }
});

// Delete habit
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    console.log(
      "📥 DELETE /habits/:id - Habit ID:",
      habitId,
      "User ID:",
      req.user.id
    );

    const habit = await Habit.findById(habitId);
    if (!habit || habit.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: "Habit not found",
      });
    }

    await habit.delete();

    console.log("✅ Habit deleted successfully");

    res.json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting habit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete habit",
    });
  }
});

// Helper functions
function getDifficultyXP(difficulty) {
  switch (difficulty) {
    case "easy":
      return 5;
    case "medium":
      return 10;
    case "hard":
      return 15;
    default:
      return 10;
  }
}

function getDifficultyCoins(difficulty) {
  switch (difficulty) {
    case "easy":
      return 2;
    case "medium":
      return 5;
    case "hard":
      return 10;
    default:
      return 5;
  }
}

module.exports = router;
