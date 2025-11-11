const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByCredentials(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists",
        });
      }

      // Create new user
      const userId = await User.create({ username, email, password });
      const user = await User.findById(userId);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        success: true,
        message: "User created successfully",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create account. Please try again.",
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByCredentials(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Login failed. Please try again.",
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.json({
        success: true,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch profile",
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { username, avatar, theme } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      await user.updateProfile({ username, avatar, theme });
      const updatedUser = await User.findById(req.user.id);

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser.toJSON(),
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  }

  // Update user stats (XP, coins, etc.)
  static async updateStats(req, res) {
    try {
      const { experience, coins, gems, health, taskCompleted, statType } =
        req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Calculate new stats
      const newExperience = user.experience + (experience || 0);
      const newCoins = user.coins + (coins || 0);
      const newGems = user.gems + (gems || 0);
      const newTaskCount = user.total_tasks_completed + (taskCompleted ? 1 : 0);

      // Update user stats
      await user.updateStats({
        experience: newExperience,
        coins: newCoins,
        gems: newGems,
        health: health || user.health,
        total_tasks_completed: newTaskCount,
        taskCompleted,
      });

      // Record daily stats
      if (statType) {
        await User.recordDailyStats(user.id, {
          experience_gained: experience || 0,
          coins_gained: coins || 0,
          [statType]: 1, // habits_completed, dailies_completed, etc.
        });
      }

      // Get updated user
      const updatedUser = await User.findById(req.user.id);

      res.json({
        success: true,
        message: "Stats updated successfully",
        user: updatedUser.toJSON(),
      });
    } catch (error) {
      console.error("Stats update error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update stats",
      });
    }
  }

  // Get user stats history
  static async getStats(req, res) {
    try {
      const days = parseInt(req.params.days) || 30;
      const stats = await User.getUserStats(req.user.id, days);

      res.json({
        success: true,
        stats,
        summary: {
          totalDays: stats.length,
          averageExperience:
            stats.reduce((sum, day) => sum + day.experience_gained, 0) /
              stats.length || 0,
          totalFocusTime: stats.reduce((sum, day) => sum + day.focus_time, 0),
          totalTasksCompleted: stats.reduce(
            (sum, day) =>
              sum +
              day.habits_completed +
              day.dailies_completed +
              day.routines_completed,
            0
          ),
        },
      });
    } catch (error) {
      console.error("Stats fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch stats",
      });
    }
  }
}

module.exports = AuthController;
