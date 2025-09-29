const database = require('../config/database');

class Daily {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.difficulty = data.difficulty;
    this.is_completed = data.is_completed || false;
    this.completion_date = data.completion_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new daily task
  static async create(dailyData) {
    try {
      const result = await database.run(`
        INSERT INTO dailies (user_id, title, description, difficulty)
        VALUES (?, ?, ?, ?)
      `, [
        dailyData.user_id,
        dailyData.title,
        dailyData.description,
        dailyData.difficulty || 'medium'
      ]);
      
      return result.lastID;
    } catch (error) {
      console.error('Error creating daily:', error);
      throw error;
    }
  }

  // Find daily by ID
  static async findById(id) {
    try {
      const daily = await database.get(`
        SELECT d.*, 
               CASE 
                 WHEN dc.completion_date = date('now') THEN 1 
                 ELSE 0 
               END as is_completed
        FROM dailies d
        LEFT JOIN daily_completions dc ON d.id = dc.daily_id AND dc.completion_date = date('now')
        WHERE d.id = ?
      `, [id]);
      
      return daily ? new Daily(daily) : null;
    } catch (error) {
      console.error('Error finding daily by ID:', error);
      throw error;
    }
  }

  // Get all daily tasks for user
  static async findByUserId(userId) {
    try {
      const dailies = await database.all(`
        SELECT d.*, 
               CASE 
                 WHEN dc.completion_date = date('now') THEN 1 
                 ELSE 0 
               END as is_completed
        FROM dailies d
        LEFT JOIN daily_completions dc ON d.id = dc.daily_id AND dc.completion_date = date('now')
        WHERE d.user_id = ?
        ORDER BY d.created_at DESC
      `, [userId]);
      
      return dailies.map(daily => new Daily({
        ...daily,
        is_completed: Boolean(daily.is_completed)
      }));
    } catch (error) {
      console.error('Error fetching dailies:', error);
      return [];
    }
  }

  // Mark daily as completed for today
  static async markCompleted(dailyId, userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      await database.run(`
        INSERT OR REPLACE INTO daily_completions (daily_id, user_id, completion_date)
        VALUES (?, ?, ?)
      `, [dailyId, userId, today]);
      
      return true;
    } catch (error) {
      console.error('Error marking daily completed:', error);
      throw error;
    }
  }

  // Get daily completion history
  static async getCompletionHistory(dailyId, days = 30) {
    try {
      const history = await database.all(`
        SELECT completion_date
        FROM daily_completions
        WHERE daily_id = ?
        AND completion_date >= date('now', '-${days} days')
        ORDER BY completion_date DESC
      `, [dailyId]);
      
      return history.map(row => row.completion_date);
    } catch (error) {
      console.error('Error fetching daily history:', error);
      return [];
    }
  }

  // Update daily task
  async update(updateData) {
    try {
      await database.run(`
        UPDATE dailies 
        SET title = ?, description = ?, difficulty = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [
        updateData.title || this.title,
        updateData.description || this.description,
        updateData.difficulty || this.difficulty,
        this.id,
        this.user_id
      ]);
      
      return true;
    } catch (error) {
      console.error('Error updating daily:', error);
      throw error;
    }
  }

  // Delete daily task
  async delete() {
    try {
      // Delete completions first
      await database.run('DELETE FROM daily_completions WHERE daily_id = ?', [this.id]);
      
      // Delete daily
      await database.run('DELETE FROM dailies WHERE id = ? AND user_id = ?', [this.id, this.user_id]);
      
      return true;
    } catch (error) {
      console.error('Error deleting daily:', error);
      throw error;
    }
  }

  // Get daily statistics for user
  static async getUserDailyStats(userId, days = 30) {
    try {
      const stats = await database.all(`
        SELECT 
          DATE(dc.completion_date) as date,
          COUNT(*) as completed_count
        FROM daily_completions dc
        JOIN dailies d ON dc.daily_id = d.id
        WHERE d.user_id = ?
        AND dc.completion_date >= date('now', '-${days} days')
        GROUP BY DATE(dc.completion_date)
        ORDER BY dc.completion_date DESC
      `, [userId]);
      
      return stats;
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      return [];
    }
  }
}

module.exports = Daily;