const database = require("../config/database");

class Daily {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.priority = data.priority;
    this.difficulty = data.difficulty;
    this.category = data.category;
    this.due_date = data.due_date;
    this.tags =
      typeof data.tags === "string"
        ? data.tags
        : JSON.stringify(data.tags || []);
    this.is_completed_today = data.is_completed_today || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new daily
  static async create(dailyData) {
    try {
      console.log("🔄 Creating daily in database:", dailyData);

      const result = await database.run(
        `INSERT INTO dailies (user_id, title, description, priority, difficulty, category, due_date, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dailyData.user_id,
          dailyData.title,
          dailyData.description || "",
          dailyData.priority || "medium",
          dailyData.difficulty || "medium",
          dailyData.category || "General",
          dailyData.due_date,
          typeof dailyData.tags === "string"
            ? dailyData.tags
            : JSON.stringify(dailyData.tags || []),
        ]
      );

      console.log("✅ Daily created with ID:", result.lastID);
      return result.lastID;
    } catch (error) {
      console.error("❌ Error creating daily:", error);
      throw error;
    }
  }

  // Find dailies by user ID
  static async findByUserId(userId) {
    try {
      console.log("🔍 Finding dailies for user:", userId);

      const dailies = await database.all(
        `SELECT d.*, 
         EXISTS(
           SELECT 1 FROM daily_completions dc 
           WHERE dc.daily_id = d.id 
           AND dc.completion_date = date('now')
         ) as is_completed_today
         FROM dailies d 
         WHERE d.user_id = ?
         ORDER BY d.created_at DESC`,
        [userId]
      );

      console.log("✅ Found dailies:", dailies.length);

      return dailies.map(
        (daily) =>
          new Daily({
            ...daily,
            is_completed_today: Boolean(daily.is_completed_today),
          })
      );
    } catch (error) {
      console.error("❌ Error finding dailies:", error);
      throw error;
    }
  }

  // Find daily by ID
  static async findById(id) {
    try {
      const daily = await database.get(
        `SELECT d.*, 
         EXISTS(
           SELECT 1 FROM daily_completions dc 
           WHERE dc.daily_id = d.id 
           AND dc.completion_date = date('now')
         ) as is_completed_today
         FROM dailies d 
         WHERE d.id = ?`,
        [id]
      );

      if (!daily) return null;

      return new Daily({
        ...daily,
        is_completed_today: Boolean(daily.is_completed_today),
      });
    } catch (error) {
      console.error("❌ Error finding daily by ID:", error);
      throw error;
    }
  }

  // Mark daily as completed
  static async markCompleted(dailyId, userId) {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      // Insert completion record
      await database.run(
        `INSERT OR IGNORE INTO daily_completions (daily_id, user_id, completion_date)
         VALUES (?, ?, ?)`,
        [dailyId, userId, today]
      );

      // Update timestamp
      await database.run(
        `UPDATE dailies SET updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [dailyId]
      );

      return true;
    } catch (error) {
      console.error("❌ Error marking daily completed:", error);
      throw error;
    }
  }

  // Delete daily
  async delete() {
    try {
      await database.run("DELETE FROM dailies WHERE id = ?", [this.id]);
      return true;
    } catch (error) {
      console.error("❌ Error deleting daily:", error);
      throw error;
    }
  }
}

module.exports = Daily;
