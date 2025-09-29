const database = require('../config/database');

class Routine {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.icon = data.icon;
    this.tasks = typeof data.tasks === 'string' 
      ? JSON.parse(data.tasks) 
      : data.tasks || [];
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new routine
  static async create(routineData) {
    try {
      const result = await database.run(`
        INSERT INTO routines (user_id, title, description, icon, tasks)
        VALUES (?, ?, ?, ?, ?)
      `, [
        routineData.user_id,
        routineData.title,
        routineData.description,
        routineData.icon || 'list-outline',
        JSON.stringify(routineData.tasks || [])
      ]);
      
      return result.lastID;
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error;
    }
  }

  // Find routine by ID
  static async findById(id) {
    try {
      const routine = await database.get(`
        SELECT * FROM routines WHERE id = ?
      `, [id]);
      
      return routine ? new Routine(routine) : null;
    } catch (error) {
      console.error('Error finding routine by ID:', error);
      throw error;
    }
  }

  // Get all routines for user
  static async findByUserId(userId) {
    try {
      const routines = await database.all(`
        SELECT r.*,
               (
                 SELECT COUNT(*)
                 FROM focus_sessions fs
                 WHERE fs.user_id = r.user_id
                 AND fs.title LIKE '%' || r.title || '%'
                 AND DATE(fs.completed_at) = date('now')
               ) as completed_today
        FROM routines r
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `, [userId]);
      
      return routines.map(routine => new Routine({
        ...routine,
        completed_today: Boolean(routine.completed_today)
      }));
    } catch (error) {
      console.error('Error fetching routines:', error);
      return [];
    }
  }

  // Update routine
  async update(updateData) {
    try {
      await database.run(`
        UPDATE routines 
        SET title = ?, description = ?, icon = ?, tasks = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [
        updateData.title || this.title,
        updateData.description || this.description,
        updateData.icon || this.icon,
        JSON.stringify(updateData.tasks || this.tasks),
        this.id,
        this.user_id
      ]);
      
      return true;
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
  }

  // Delete routine
  async delete() {
    try {
      await database.run('DELETE FROM routines WHERE id = ? AND user_id = ?', [this.id, this.user_id]);
      return true;
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  }

  // Record routine completion
  static async recordCompletion(routineId, userId, completedTasks = []) {
    try {
      const routine = await Routine.findById(routineId);
      if (!routine || routine.user_id !== userId) {
        throw new Error('Routine not found');
      }

      // Calculate completion percentage
      const totalTasks = routine.tasks.length;
      const completedCount = completedTasks.length;
      const completionRate = totalTasks > 0 ? (completedCount / totalTasks) : 0;

      // Record in focus_sessions table for tracking
      await database.run(`
        INSERT INTO focus_sessions (user_id, title, duration_minutes, completed_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        userId,
        `Routine: ${routine.title} (${Math.round(completionRate * 100)}%)`,
        Math.max(completedCount * 5, 5) // Estimate 5 minutes per task
      ]);

      return {
        routine,
        completionRate,
        completedTasks: completedCount,
        totalTasks
      };
    } catch (error) {
      console.error('Error recording routine completion:', error);
      throw error;
    }
  }

  // Get routine completion history
  static async getCompletionHistory(routineId, days = 30) {
    try {
      const routine = await Routine.findById(routineId);
      if (!routine) return [];

      const history = await database.all(`
        SELECT 
          DATE(completed_at) as date,
          COUNT(*) as completions,
          AVG(duration_minutes) as avg_duration
        FROM focus_sessions
        WHERE user_id = ?
        AND title LIKE '%' || ? || '%'
        AND completed_at >= datetime('now', '-${days} days')
        GROUP BY DATE(completed_at)
        ORDER BY date DESC
      `, [routine.user_id, routine.title]);
      
      return history;
    } catch (error) {
      console.error('Error fetching routine history:', error);
      return [];
    }
  }

  // Get routine statistics
  static async getRoutineStats(userId, days = 30) {
    try {
      const stats = await database.all(`
        SELECT 
          r.id,
          r.title,
          COUNT(fs.id) as total_completions,
          AVG(fs.duration_minutes) as avg_duration,
          MAX(DATE(fs.completed_at)) as last_completed
        FROM routines r
        LEFT JOIN focus_sessions fs ON fs.user_id = r.user_id 
          AND fs.title LIKE '%' || r.title || '%'
          AND fs.completed_at >= datetime('now', '-${days} days')
        WHERE r.user_id = ?
        GROUP BY r.id, r.title
        ORDER BY total_completions DESC
      `, [userId]);
      
      return stats;
    } catch (error) {
      console.error('Error fetching routine stats:', error);
      return [];
    }
  }

  // Duplicate routine
  async duplicate(newTitle = null) {
    try {
      const duplicatedRoutine = {
        user_id: this.user_id,
        title: newTitle || `${this.title} (Copy)`,
        description: this.description,
        icon: this.icon,
        tasks: [...this.tasks] // Create a copy of tasks array
      };

      const newRoutineId = await Routine.create(duplicatedRoutine);
      return await Routine.findById(newRoutineId);
    } catch (error) {
      console.error('Error duplicating routine:', error);
      throw error;
    }
  }
}

module.exports = Routine;