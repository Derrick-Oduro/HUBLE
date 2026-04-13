const express = require("express");
const router = express.Router();
const achievementsController = require("../controllers/achievementsController");
const authenticateToken = require("../middleware/auth");

// Get all achievements with user progress
router.get("/", authenticateToken, achievementsController.getAchievements);

// Check and unlock achievements based on current stats
router.post(
  "/check",
  authenticateToken,
  achievementsController.checkAchievements,
);

// Get achievement statistics
router.get("/stats", authenticateToken, achievementsController.getStats);

// Get unlocked achievements
router.get("/unlocked", authenticateToken, achievementsController.getUnlocked);

// Seed default achievements (for initial setup)
router.post("/seed", achievementsController.seedAchievements);

module.exports = router;
