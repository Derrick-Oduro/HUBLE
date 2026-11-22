const express = require("express");
const router = express.Router();
const FocusSession = require("../models/FocusSession");
const authenticateToken = require("../middleware/auth");

const LINKABLE_TASK_TYPES = new Set(["habit", "daily", "routine"]);

// Record focus session
router.post("/sessions", authenticateToken, async (req, res) => {
  try {
    console.log("📥 POST /focus/sessions - User ID:", req.user.id);
    console.log("📥 Session data:", req.body);

    const {
      session_type,
      duration_planned,
      duration_actual,
      habit_id,
      task_type,
      task_id,
      focus_topic,
      completed,
      experience_gained,
      coins_gained,
    } = req.body;

    // A session may be linked to one habit, daily or routine.
    const linkedType = LINKABLE_TASK_TYPES.has(task_type) ? task_type : null;
    const linkedId = linkedType && Number.isInteger(Number(task_id)) ? Number(task_id) : null;
    const numericHabitId = Number.isInteger(Number(habit_id)) && habit_id !== null ? Number(habit_id) : null;

    const sessionData = {
      user_id: req.user.id,
      session_type: session_type || "work",
      duration_planned: duration_planned || 0,
      duration_actual: duration_actual || 0,
      habit_id: linkedType === "habit" ? linkedId : numericHabitId,
      task_type: linkedId !== null ? linkedType : null,
      task_id: linkedId,
      focus_topic: focus_topic || "Focus Session",
      completed: completed ?? true,
      experience_gained: experience_gained || 0,
      coins_gained: coins_gained || 0,
    };

    const sessionId = await FocusSession.create(sessionData);
    const newSession = await FocusSession.findById(sessionId);

    console.log("✅ Focus session recorded successfully");

    res.status(201).json({
      success: true,
      message: "Focus session recorded successfully",
      session: newSession,
    });
  } catch (error) {
    console.error("❌ Error recording focus session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record focus session",
    });
  }
});

// Focus minutes per linked task (habit / daily / routine)
router.get("/task-totals", authenticateToken, async (req, res) => {
  try {
    const period = ["today", "week", "all"].includes(req.query.period) ? req.query.period : "today";
    const totals = await FocusSession.getTaskTotals(req.user.id, period);
    res.json({ success: true, period, totals });
  } catch (error) {
    console.error("❌ Error fetching focus task totals:", error);
    res.status(500).json({ success: false, error: "Failed to fetch focus totals" });
  }
});

// Get user's focus sessions
router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const { period } = req.query; // 'today', 'week', 'month'

    const sessions = await FocusSession.findByUserId(req.user.id, period);

    res.json({
      success: true,
      sessions: sessions,
    });
  } catch (error) {
    console.error("❌ Error fetching focus sessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch focus sessions",
    });
  }
});

// Save/update focus preferences
router.post("/preferences", authenticateToken, async (req, res) => {
  try {
    console.log("📥 POST /focus/preferences - User ID:", req.user.id);
    console.log("📥 Preferences data:", req.body);

    const {
      work_duration,
      short_break,
      long_break,
      auto_start,
      sound_enabled,
      vibration_enabled,
    } = req.body;

    const preferencesData = {
      user_id: req.user.id,
      work_duration: work_duration || 1500, // 25 minutes default
      short_break: short_break || 300, // 5 minutes default
      long_break: long_break || 900, // 15 minutes default
      auto_start: auto_start ?? false,
      sound_enabled: sound_enabled ?? true,
      vibration_enabled: vibration_enabled ?? true,
    };

    await FocusSession.savePreferences(preferencesData);

    console.log("✅ Focus preferences saved successfully");

    res.json({
      success: true,
      message: "Focus preferences saved successfully",
    });
  } catch (error) {
    console.error("❌ Error saving focus preferences:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save focus preferences",
    });
  }
});

// Get user's focus preferences
router.get("/preferences", authenticateToken, async (req, res) => {
  try {
    console.log("📥 GET /focus/preferences - User ID:", req.user.id);

    const preferences = await FocusSession.getPreferences(req.user.id);

    console.log("✅ Focus preferences retrieved:", preferences);

    res.json({
      success: true,
      preferences: preferences,
    });
  } catch (error) {
    console.error("❌ Error fetching focus preferences:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch focus preferences",
    });
  }
});

module.exports = router;
