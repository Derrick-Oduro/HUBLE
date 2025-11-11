const database = require("../config/database");

class Habit {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.difficulty = data.difficulty;
    this.color = data.color;
    this.target_days =
      typeof data.target_days === "string"
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
      console.log("🔄 Creating habit in database:", habitData);

      const result = await database.run(
        `INSERT INTO habits (user_id, title, description, difficulty, color, target_days)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          habitData.user_id,
          habitData.title,
          habitData.description || "",
          habitData.difficulty || "medium",
          habitData.color || "#3B82F6",
          JSON.stringify(habitData.target_days || [1, 2, 3, 4, 5, 6, 0]),
        ]
      );

      console.log("✅ Habit created with ID:", result.lastID);
      return result.lastID;
    } catch (error) {
      console.error("❌ Error creating habit:", error);
      throw error;
    }
  }

  // Find habits by user ID
  static async findByUserId(userId) {
    try {
      console.log("🔍 Finding habits for user:", userId);

      const habits = await database.all(
        `SELECT h.*, 
         EXISTS(
           SELECT 1 FROM habit_completions hc 
           WHERE hc.habit_id = h.id 
           AND hc.completion_date = date('now')
         ) as is_completed_today
         FROM habits h 
         WHERE h.user_id = ?
         ORDER BY h.created_at DESC`,
        [userId]
      );

      console.log("✅ Found habits:", habits.length);

      return habits.map(
        (habit) =>
          new Habit({
            ...habit,
            is_completed_today: Boolean(habit.is_completed_today),
          })
      );
    } catch (error) {
      console.error("❌ Error finding habits:", error);
      throw error;
    }
  }

  // Find habit by ID
  static async findById(id) {
    try {
      const habit = await database.get(
        `SELECT h.*, 
         EXISTS(
           SELECT 1 FROM habit_completions hc 
           WHERE hc.habit_id = h.id 
           AND hc.completion_date = date('now')
         ) as is_completed_today
         FROM habits h 
         WHERE h.id = ?`,
        [id]
      );

      if (!habit) return null;

      return new Habit({
        ...habit,
        is_completed_today: Boolean(habit.is_completed_today),
      });
    } catch (error) {
      console.error("❌ Error finding habit by ID:", error);
      throw error;
    }
  }

  // Mark habit as completed
  static async markCompleted(habitId, userId) {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      // Insert completion record
      await database.run(
        `INSERT OR IGNORE INTO habit_completions (habit_id, user_id, completion_date)
         VALUES (?, ?, ?)`,
        [habitId, userId, today]
      );

      // Update streak
      const streak = await this.calculateStreak(habitId);
      await database.run(
        `UPDATE habits SET streak = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [streak, habitId]
      );

      return streak;
    } catch (error) {
      console.error("❌ Error marking habit completed:", error);
      throw error;
    }
  }

  // Calculate current streak
  static async calculateStreak(habitId) {
    try {
      const completions = await database.all(
        `SELECT completion_date FROM habit_completions 
         WHERE habit_id = ? 
         ORDER BY completion_date DESC`,
        [habitId]
      );

      if (completions.length === 0) return 0;

      let streak = 0;
      const today = new Date();

      for (let i = 0; i < completions.length; i++) {
        const completionDate = new Date(completions[i].completion_date);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (completionDate.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error("❌ Error calculating streak:", error);
      return 0;
    }
  }

  // Delete habit
  async delete() {
    try {
      await database.run("DELETE FROM habits WHERE id = ?", [this.id]);
      return true;
    } catch (error) {
      console.error("❌ Error deleting habit:", error);
      throw error;
    }
  }
}

module.exports = Habit;
