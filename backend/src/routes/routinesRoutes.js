const express = require("express");
const router = express.Router();
const Routine = require("../models/Routine");
const authenticateToken = require("../middleware/auth");

// Get all routines for user
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("📥 GET /routines - User ID:", req.user.id);

    const routines = await Routine.findByUserId(req.user.id);

    console.log("✅ Found routines:", routines.length);

    res.json({
      success: true,
      routines: routines,
    });
  } catch (error) {
    console.error("❌ Error fetching routines:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch routines",
    });
  }
});

// Create new routine
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("📥 POST /routines - Request body:", req.body);
    console.log("📥 User ID:", req.user.id);

    const { title, description, icon, tasks } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      console.log("❌ Validation failed: Missing title");
      return res.status(400).json({
        success: false,
        error: "Title is required",
      });
    }

    const routineData = {
      user_id: req.user.id,
      title: title.trim(),
      description: description || "",
      icon: icon || "list-outline",
      tasks: Array.isArray(tasks) ? JSON.stringify(tasks) : "[]",
    };

    console.log("📤 Creating routine with data:", routineData);

    const routineId = await Routine.create(routineData);

    if (!routineId) {
      throw new Error("Failed to create routine");
    }

    // Fetch the created routine
    const newRoutine = await Routine.findById(routineId);

    console.log("✅ Routine created successfully:", newRoutine);

    res.status(201).json({
      success: true,
      message: "Routine created successfully",
      routine: newRoutine,
    });
  } catch (error) {
    console.error("❌ Error creating routine:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create routine: " + error.message,
    });
  }
});

// Update routine
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const routineId = parseInt(req.params.id);
    console.log(
      "📥 PUT /routines/:id - Routine ID:",
      routineId,
      "User ID:",
      req.user.id
    );

    // Check if routine belongs to user
    const routine = await Routine.findById(routineId);
    if (!routine || routine.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: "Routine not found",
      });
    }

    const { title, description, icon, tasks } = req.body;

    const updateData = {
      title: title?.trim() || routine.title,
      description: description || routine.description,
      icon: icon || routine.icon,
      tasks: Array.isArray(tasks) ? JSON.stringify(tasks) : routine.tasks,
    };

    await Routine.update(routineId, updateData);

    // Get updated routine
    const updatedRoutine = await Routine.findById(routineId);

    console.log("✅ Routine updated successfully:", updatedRoutine);

    res.json({
      success: true,
      message: "Routine updated successfully",
      routine: updatedRoutine,
    });
  } catch (error) {
    console.error("❌ Error updating routine:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update routine",
    });
  }
});

// Complete routine
router.post("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const routineId = parseInt(req.params.id);
    console.log(
      "📥 POST /routines/:id/complete - Routine ID:",
      routineId,
      "User ID:",
      req.user.id
    );

    // Check if routine belongs to user
    const routine = await Routine.findById(routineId);
    if (!routine || routine.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: "Routine not found",
      });
    }

    await Routine.markCompleted(routineId, req.user.id);

    // Get updated routine
    const updatedRoutine = await Routine.findById(routineId);

    console.log("✅ Routine completed successfully:", updatedRoutine);

    // Calculate rewards based on number of tasks
    const tasks = JSON.parse(routine.tasks || "[]");
    const baseXP = 20;
    const bonusXP = Math.min(tasks.length * 5, 30); // 5 XP per task, max 30 bonus
    const totalXP = baseXP + bonusXP;

    const baseCoins = 10;
    const bonusCoins = Math.min(tasks.length * 2, 15); // 2 coins per task, max 15 bonus
    const totalCoins = baseCoins + bonusCoins;

    res.json({
      success: true,
      message: `Routine completed! Amazing work on all ${tasks.length} tasks!`,
      routine: updatedRoutine,
      rewards: {
        experience: totalXP,
        coins: totalCoins,
      },
    });
  } catch (error) {
    console.error("❌ Error completing routine:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete routine",
    });
  }
});

// Delete routine
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const routineId = parseInt(req.params.id);
    console.log(
      "📥 DELETE /routines/:id - Routine ID:",
      routineId,
      "User ID:",
      req.user.id
    );

    const routine = await Routine.findById(routineId);
    if (!routine || routine.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: "Routine not found",
      });
    }

    await Routine.delete(routineId);

    console.log("✅ Routine deleted successfully");

    res.json({
      success: true,
      message: "Routine deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting routine:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete routine",
    });
  }
});

module.exports = router;
