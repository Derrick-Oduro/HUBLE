const Daily = require('../models/Daily');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class DailiesController {
  // Get all daily tasks for user
  static async getDailies(req, res) {
    try {
      const dailies = await Daily.findByUserId(req.user.id);
      
      res.json({
        success: true,
        dailies
      });
    } catch (error) {
      console.error('Error fetching dailies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch daily tasks'
      });
    }
  }

  // Create new daily task
  static async createDaily(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { title, description, difficulty } = req.body;

      const dailyId = await Daily.create({
        user_id: req.user.id,
        title,
        description,
        difficulty
      });

      const daily = await Daily.findById(dailyId);

      res.status(201).json({
        success: true,
        message: 'Daily task created successfully',
        daily
      });

    } catch (error) {
      console.error('Error creating daily:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create daily task'
      });
    }
  }

  // Update daily task
  static async updateDaily(req, res) {
    try {
      const { id } = req.params;
      const { title, description, difficulty } = req.body;

      const daily = await Daily.findById(id);
      if (!daily || daily.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Daily task not found'
        });
      }

      await daily.update({
        title,
        description,
        difficulty
      });

      const updatedDaily = await Daily.findById(id);

      res.json({
        success: true,
        message: 'Daily task updated successfully',
        daily: updatedDaily
      });

    } catch (error) {
      console.error('Error updating daily:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update daily task'
      });
    }
  }

  // Mark daily task as completed
  static async completeDaily(req, res) {
    try {
      const { id } = req.params;

      const daily = await Daily.findById(id);
      if (!daily || daily.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Daily task not found'
        });
      }

      // Mark daily as completed
      await Daily.markCompleted(id, req.user.id);

      // Calculate rewards based on difficulty
      const rewards = this.calculateRewards(daily.difficulty);

      // Update user stats
      const user = await User.findById(req.user.id);
      await user.updateStats({
        experience: user.experience + rewards.experience,
        coins: user.coins + rewards.coins,
        health: user.health,
        gems: user.gems,
        total_tasks_completed: user.total_tasks_completed + 1,
        taskCompleted: true
      });

      // Record daily stats
      await User.recordDailyStats(req.user.id, {
        dailies_completed: 1,
        experience_gained: rewards.experience,
        coins_gained: rewards.coins
      });

      // Get updated data
      const updatedUser = await User.findById(req.user.id);
      const updatedDaily = await Daily.findById(id);

      res.json({
        success: true,
        message: 'Daily task completed! 🎉',
        daily: updatedDaily,
        user: updatedUser.toJSON(),
        rewards
      });

    } catch (error) {
      console.error('Error completing daily:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete daily task'
      });
    }
  }

  // Delete daily task
  static async deleteDaily(req, res) {
    try {
      const { id } = req.params;

      const daily = await Daily.findById(id);
      if (!daily || daily.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Daily task not found'
        });
      }

      await daily.delete();

      res.json({
        success: true,
        message: 'Daily task deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting daily:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete daily task'
      });
    }
  }

  // Helper method to calculate rewards
  static calculateRewards(difficulty) {
    const baseRewards = {
      easy: { experience: 8, coins: 5 },
      medium: { experience: 12, coins: 7 },
      hard: { experience: 18, coins: 10 }
    };

    return baseRewards[difficulty] || baseRewards.medium;
  }
}

module.exports = DailiesController;