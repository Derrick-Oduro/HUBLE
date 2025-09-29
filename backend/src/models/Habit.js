const database = require('../config/database');

class Habit {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.difficulty = data.difficulty;
    this.color = data.color;
    this.target_days = typeof data.target_days === 'string' 
      ? JSON.parse(data.target_days) 
      : data.target_days;
    this.streak = data.streak || 0;
    this.is_completed_today = data.is_completed_today || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new habit
  static async create(habitData) {
    try {
      const result = await database.run(`
        INSERT INTO habits (user_id, title, description, difficulty, color, target_days)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        habitData.user_id,
        habitData.title,
        habitData.description,
        habitData.difficulty || 'medium',
        habitData.color || 'blue-500',
        JSON.stringify(habitData.target_days)
      ]);
      
      return result.lastID;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }

  // Find habit by ID
  static async findById(id) {
    try {
      const habit = await database.get(`
        SELECT h.*, 
               CASE 
                 WHEN hc.completion_date = date('now') THEN 1 
                 ELSE 0 
               END as is_completed_today,
               (
                 SELECT COUNT(*) 
                 FROM habit_completions hc2 
                 WHERE hc2.habit_id = h.id 
                 AND hc2.completion_date >= date('now', '-30 days')
               ) as recent_completions
        FROM habits h
        LEFT JOIN habit_completions hc ON h.id = hc.habit_id AND hc.completion_date = date('now')
        WHERE h.id = ?
      `, [id]);
      
      return habit ? new Habit({
        ...habit,
        is_completed_today: Boolean(habit.is_completed_today)
      }) : null;
    } catch (error) {
      console.error('Error finding habit by ID:', error);
      throw error;
    }
  }

  // Get all habits for user
  static async findByUserId(userId) {
    try {
      const habits = await database.all(`
        SELECT h.*, 
               CASE 
                 WHEN hc.completion_date = date('now') THEN 1 
                 ELSE 0 
               END as is_completed_today,
               (
                 SELECT COUNT(*) 
                 FROM habit_completions hc2 
                 WHERE hc2.habit_id = h.id 
                 AND hc2.completion_date >= date('now', '-30 days')
               ) as recent_completions
        FROM habits h
        LEFT JOIN habit_completions hc ON h.id = hc.habit_id AND hc.completion_date = date('now')
        WHERE h.user_id = ?
        ORDER BY h.created_at DESC
      `, [userId]);
      
      return habits.map(habit => new Habit({
        ...habit,
        is_completed_today: Boolean(habit.is_completed_today)
      }));
    } catch (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
  }

  // Mark habit as completed for today
  static async markCompleted(habitId, userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await database.transaction(async () => {
        // Add completion record
        await database.run(`
          INSERT OR REPLACE INTO habit_completions (habit_id, user_id, completion_date)
          VALUES (?, ?, ?)
        `, [habitId, userId, today]);
        
        // Update streak
        await database.run(`
          UPDATE habits 
          SET streak = streak + 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [habitId]);
      });
      
      return true;
    } catch (error) {
      console.error('Error marking habit completed:', error);
      throw error;
    }
  }

  // Get habit completion history
  static async getCompletionHistory(habitId, days = 30) {
    try {
      const history = await database.all(`
        SELECT completion_date
        FROM habit_completions
        WHERE habit_id = ?
        AND completion_date >= date('now', '-${days} days')
        ORDER BY completion_date DESC
      `, [habitId]);
      
      return history.map(row => row.completion_date);
    } catch (error) {
      console.error('Error fetching habit history:', error);
      return [];
    }
  }

  // Update habit
  async update(updateData) {
    try {
      await database.run(`
        UPDATE habits 
        SET title = ?, description = ?, difficulty = ?, color = ?, target_days = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [
        updateData.title || this.title,
        updateData.description || this.description,
        updateData.difficulty || this.difficulty,
        updateData.color || this.color,
        JSON.stringify(updateData.target_days || this.target_days),
        this.id,
        this.user_id
      ]);
      
      return true;
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  }

  // Delete habit
  async delete() {
    try {
      // Delete completions first
      await database.run('DELETE FROM habit_completions WHERE habit_id = ?', [this.id]);
      
      // Delete habit
      await database.run('DELETE FROM habits WHERE id = ? AND user_id = ?', [this.id, this.user_id]);
      
      return true;
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // Calculate current streak
  async calculateStreak() {
    try {
      const completions = await database.all(`
        SELECT completion_date
        FROM habit_completions
        WHERE habit_id = ?
        ORDER BY completion_date DESC
      `, [this.id]);
      
      if (completions.length === 0) return 0;
      
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (const completion of completions) {
        const completionDate = new Date(completion.completion_date);
        completionDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((currentDate - completionDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      // Update streak in database
      await database.run('UPDATE habits SET streak = ? WHERE id = ?', [streak, this.id]);
      this.streak = streak;
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  // Get habit statistics
  static async getHabitStats(habitId, days = 30) {
    try {
      const stats = await database.all(`
        SELECT 
          DATE(completion_date) as date,
          COUNT(*) as completions
        FROM habit_completions
        WHERE habit_id = ?
        AND completion_date >= date('now', '-${days} days')
        GROUP BY DATE(completion_date)
        ORDER BY completion_date DESC
      `, [habitId]);
      
      return stats;
    } catch (error) {
      console.error('Error fetching habit stats:', error);
      return [];
    }
  }
}

module.exports = Habit;