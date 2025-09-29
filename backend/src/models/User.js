const bcrypt = require('bcrypt');
const database = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.level = data.level || 1;
    this.experience = data.experience || 0;
    this.max_experience = data.max_experience || 100;
    this.health = data.health || 100;
    this.max_health = data.max_health || 100;
    this.coins = data.coins || 0;
    this.gems = data.gems || 0;
    this.avatar = data.avatar || '😊';
    this.theme = data.theme || 'dark';
    this.total_tasks_completed = data.total_tasks_completed || 0;
    this.current_streak = data.current_streak || 0;
    this.longest_streak = data.longest_streak || 0;
    this.last_activity_date = data.last_activity_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new user
  static async create(userData) {
    try {
      const { username, email, password } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await database.run(`
        INSERT INTO users (username, email, password, level, experience, max_experience, health, max_health, coins, gems)
        VALUES (?, ?, ?, 1, 0, 100, 100, 100, 0, 0)
      `, [username, email, hashedPassword]);
      
      return result.lastID;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by email or username
  static async findByCredentials(identifier) {
    try {
      const user = await database.get(`
        SELECT * FROM users 
        WHERE email = ? OR username = ?
      `, [identifier, identifier]);
      
      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by credentials:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const user = await database.get('SELECT * FROM users WHERE id = ?', [id]);
      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Update user stats
  async updateStats(stats) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate new level based on experience
      const newExperience = stats.experience || this.experience;
      const newLevel = Math.floor(newExperience / 100) + 1;
      const newMaxExperience = newLevel * 100;
      
      // Update streak logic
      let updateQuery = `
        UPDATE users 
        SET experience = ?, level = ?, max_experience = ?, health = ?, 
            coins = ?, gems = ?, total_tasks_completed = ?, updated_at = CURRENT_TIMESTAMP
      `;
      let queryParams = [
        newExperience,
        newLevel,
        newMaxExperience,
        stats.health || this.health,
        stats.coins || this.coins,
        stats.gems || this.gems,
        stats.total_tasks_completed || this.total_tasks_completed
      ];

      if (stats.taskCompleted) {
        updateQuery += ', current_streak = current_streak + 1, longest_streak = MAX(longest_streak, current_streak + 1), last_activity_date = ?';
        queryParams.push(today);
      }

      updateQuery += ' WHERE id = ?';
      queryParams.push(this.id);

      await database.run(updateQuery, queryParams);
      
      // Update instance properties
      this.experience = newExperience;
      this.level = newLevel;
      this.max_experience = newMaxExperience;
      this.health = stats.health || this.health;
      this.coins = stats.coins || this.coins;
      this.gems = stats.gems || this.gems;
      
      return true;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      await database.run(`
        UPDATE users 
        SET username = ?, avatar = ?, theme = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        profileData.username || this.username,
        profileData.avatar || this.avatar,
        profileData.theme || this.theme,
        this.id
      ]);

      // Update instance properties
      this.username = profileData.username || this.username;
      this.avatar = profileData.avatar || this.avatar;
      this.theme = profileData.theme || this.theme;
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  // Get user stats for a specific date range
  static async getUserStats(userId, days = 30) {
    try {
      const stats = await database.all(`
        SELECT 
          stat_date,
          habits_completed,
          dailies_completed,
          routines_completed,
          focus_time,
          experience_gained,
          coins_gained
        FROM user_stats 
        WHERE user_id = ? 
        AND stat_date >= date('now', '-${days} days')
        ORDER BY stat_date DESC
      `, [userId]);
      
      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Record daily stats
  static async recordDailyStats(userId, statsData) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await database.run(`
        INSERT OR REPLACE INTO user_stats (
          user_id, stat_date, habits_completed, dailies_completed, 
          routines_completed, focus_time, experience_gained, coins_gained
        ) VALUES (?, ?, 
          COALESCE((SELECT habits_completed FROM user_stats WHERE user_id = ? AND stat_date = ?), 0) + ?,
          COALESCE((SELECT dailies_completed FROM user_stats WHERE user_id = ? AND stat_date = ?), 0) + ?,
          COALESCE((SELECT routines_completed FROM user_stats WHERE user_id = ? AND stat_date = ?), 0) + ?,
          COALESCE((SELECT focus_time FROM user_stats WHERE user_id = ? AND stat_date = ?), 0) + ?,
          COALESCE((SELECT experience_gained FROM user_stats WHERE user_id = ? AND stat_date = ?), 0) + ?,
          COALESCE((SELECT coins_gained FROM user_stats WHERE user_id = ? AND stat_date = ?), 0) + ?
        )
      `, [
        userId, today,
        userId, today, statsData.habits_completed || 0,
        userId, today, statsData.dailies_completed || 0,
        userId, today, statsData.routines_completed || 0,
        userId, today, statsData.focus_time || 0,
        userId, today, statsData.experience_gained || 0,
        userId, today, statsData.coins_gained || 0
      ]);
      
      return true;
    } catch (error) {
      console.error('Error recording daily stats:', error);
      throw error;
    }
  }

  // Get user without sensitive data
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;