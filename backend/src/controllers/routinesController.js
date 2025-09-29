const Routine = require('../models/Routine');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class RoutinesController {
  // Get all routines for user
  static async getRoutines(req, res) {
    try {
      const routines = await Routine.findByUserId(req.user.id);
      
      res.json({
        success: true,
        routines
      });
    } catch (error) {
      console.error('Error fetching routines:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch routines'
      });
    }
  }

  // Create new routine
  static async createRoutine(req, res) {
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

      const { title, description, icon, tasks } = req.body;

      const routineId = await Routine.create({
        user_id: req.user.id,
        title,
        description,
        icon,
        tasks
      });

      const routine = await Routine.findById(routineId);

      res.status(201).json({
        success: true,
        message: 'Routine created successfully',
        routine
      });

    } catch (error) {
      console.error('Error creating routine:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create routine'
      });
    }
  }

  // Update routine
  static async updateRoutine(req, res) {
    try {
      const { id } = req.params;
      const { title, description, icon, tasks } = req.body;

      const routine = await Routine.findById(id);
      if (!routine || routine.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Routine not found'
        });
      }

      await routine.update({
        title,
        description,
        icon,
        tasks
      });

      const updatedRoutine = await Routine.findById(id);

      res.json({
        success: true,
        message: 'Routine updated successfully',
        routine: updatedRoutine
      });

    } catch (error) {
      console.error('Error updating routine:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update routine'
      });
    }
  }

  // Complete routine
  static async completeRoutine(req, res) {
    try {
      const { id } = req.params;
      const { completedTasks } = req.body; // Array of completed task indices

      const routine = await Routine.findById(id);
      if (!routine || routine.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Routine not found'
        });
      }

      // Calculate completion percentage
      const totalTasks = routine.tasks.length;
      const completedCount = completedTasks?.length || 0;
      const completionRate = totalTasks > 0 ? (completedCount / totalTasks) : 0;

      // Calculate rewards based on completion rate
      const rewards = this.calculateRewards(completionRate, totalTasks);

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
        routines_completed: 1,
        experience_gained: rewards.experience,
        coins_gained: rewards.coins
      });

      // Get updated user
      const updatedUser = await User.findById(req.user.id);

      res.json({
        success: true,
        message: `Routine completed! ${Math.round(completionRate * 100)}% completion 🎉`,
        routine,
        user: updatedUser.toJSON(),
        rewards,
        completionRate: Math.round(completionRate * 100)
      });

    } catch (error) {
      console.error('Error completing routine:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete routine'
      });
    }
  }

  // Delete routine
  static async deleteRoutine(req, res) {
    try {
      const { id } = req.params;

      const routine = await Routine.findById(id);
      if (!routine || routine.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          error: 'Routine not found'
        });
      }

      await routine.delete();

      res.json({
        success: true,
        message: 'Routine deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting routine:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete routine'
      });
    }
  }

  // Helper method to calculate rewards based on completion rate
  static calculateRewards(completionRate, taskCount) {
    const baseExperience = 10;
    const baseCoins = 6;
    
    // Bonus for completion rate
    const completionBonus = Math.floor(completionRate * 10);
    
    // Bonus for number of tasks
    const taskBonus = Math.min(taskCount * 2, 20); // Max 20 bonus

    return {
      experience: baseExperience + completionBonus + Math.floor(taskBonus / 2),
      coins: baseCoins + Math.floor(completionBonus / 2) + Math.floor(taskBonus / 3)
    };
  }
}

module.exports = RoutinesController;