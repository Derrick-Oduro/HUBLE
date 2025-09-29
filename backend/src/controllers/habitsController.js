const Habit = require('../models/Habit');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class HabitsController {
  // Get all habits for user
  static async getHabits(req, res) {
    try {
      const habits = await Habit.findByUserId(req.user.id);
      
      res.json({
        success: true,
        habits
      });
    } catch (error) {
      console.error('Error fetching habits:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch habits'
      });
    }
  }

  // Create new habit
  static async createHabit(req, res) {
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

      const { title, description, difficulty, color, target_days } = req.body;

      const habitId = await Habit.create({
        user_id: req.user.id,
        title,
        description,
        difficulty,
        color,
        target_days
      });

      const habit = await Habit.findById(habitId);

      res.status(201).json({
        success: true,
        message: 'Habit created successfully',
        habit
      });

    } catch (error) {
      console.error('Error creating habit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create habit'
      });
    }
  }

  // Update habit
  static async updateHabit(req, res) {
    try {
      const { id } = req.params;
      const { title, description, difficulty, color, target_days } = req.body;

      const habit = await Habit.findById(id);
      if (!habit || habit.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Habit not found'
        });
      }

      await habit.update({
        title,
        description,
        difficulty,
        color,
        target_days
      });

      const updatedHabit = await Habit.findById(id);

      res.json({
        success: true,
        message: 'Habit updated successfully',
        habit: updatedHabit
      });

    } catch (error) {
      console.error('Error updating habit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update habit'
      });
    }
  }

  // Mark habit as completed
  static async completeHabit(req, res) {
    try {
      const { id } = req.params;

      const habit = await Habit.findById(id);
      if (!habit || habit.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Habit not found'
        });
      }

      // Mark habit as completed
      await Habit.markCompleted(id, req.user.id);

      // Calculate rewards based on difficulty
      const rewards = this.calculateRewards(habit.difficulty, habit.streak + 1);

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
        habits_completed: 1,
        experience_gained: rewards.experience,
        coins_gained: rewards.coins
      });

      // Get updated data
      const updatedUser = await User.findById(req.user.id);
      const updatedHabit = await Habit.findById(id);

      res.json({
        success: true,
        message: 'Habit completed! 🎉',
        habit: updatedHabit,
        user: updatedUser.toJSON(),
        rewards
      });

    } catch (error) {
      console.error('Error completing habit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete habit'
      });
    }
  }

  // Get habit completion history
  static async getHabitHistory(req, res) {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days) || 30;

      const habit = await Habit.findById(id);
      if (!habit || habit.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Habit not found'
        });
      }

      const history = await Habit.getCompletionHistory(id, days);

      res.json({
        success: true,
        history
      });

    } catch (error) {
      console.error('Error fetching habit history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch habit history'
      });
    }
  }

  // Delete habit
  static async deleteHabit(req, res) {
    try {
      const { id } = req.params;

      const habit = await Habit.findById(id);
      if (!habit || habit.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Habit not found'
        });
      }

      await habit.delete();

      res.json({
        success: true,
        message: 'Habit deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting habit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete habit'
      });
    }
  }

  // Helper method to calculate rewards
  static calculateRewards(difficulty, streak) {
    const baseRewards = {
      easy: { experience: 5, coins: 3 },
      medium: { experience: 10, coins: 5 },
      hard: { experience: 15, coins: 8 }
    };

    const base = baseRewards[difficulty] || baseRewards.medium;
    const streakBonus = Math.floor(streak / 5) * 2; // Bonus every 5 streak

    return {
      experience: base.experience + streakBonus,
      coins: base.coins + Math.floor(streakBonus / 2)
    };
  }
}

module.exports = HabitsController;