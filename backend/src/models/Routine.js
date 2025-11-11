const database = require("../config/database");

class Routine {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.icon = data.icon;
    this.tasks =
      typeof data.tasks === "string"
        ? data.tasks
        : JSON.stringify(data.tasks || []);
    this.completed_today = data.completed_today || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new routine
  static async create(routineData) {
    try {
      console.log("🔄 Creating routine in database:", routineData);

      const result = await database.run(
        `INSERT INTO routines (user_id, title, description, icon, tasks)
         VALUES (?, ?, ?, ?, ?)`,
        [
          routineData.user_id,
          routineData.title,
          routineData.description || "",
          routineData.icon || "list-outline",
          typeof routineData.tasks === "string"
            ? routineData.tasks
            : JSON.stringify(routineData.tasks || []),
        ]
      );

      console.log("✅ Routine created with ID:", result.lastID);
      return result.lastID;
    } catch (error) {
      console.error("❌ Error creating routine:", error);
      throw error;
    }
  }

  // Find routines by user ID
  static async findByUserId(userId) {
    try {
      console.log("🔍 Finding routines for user:", userId);

      const routines = await database.all(
        `SELECT r.*, 
         EXISTS(
           SELECT 1 FROM routine_completions rc 
           WHERE rc.routine_id = r.id 
           AND rc.completion_date = date('now')
         ) as completed_today
         FROM routines r 
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );

      console.log("✅ Found routines:", routines.length);

      return routines.map(
        (routine) =>
          new Routine({
            ...routine,
            completed_today: Boolean(routine.completed_today),
          })
      );
    } catch (error) {
      console.error("❌ Error finding routines:", error);
      throw error;
    }
  }

  // Find routine by ID
  static async findById(id) {
    try {
      const routine = await database.get(
        `SELECT r.*, 
         EXISTS(
           SELECT 1 FROM routine_completions rc 
           WHERE rc.routine_id = r.id 
           AND rc.completion_date = date('now')
         ) as completed_today
         FROM routines r 
         WHERE r.id = ?`,
        [id]
      );

      if (!routine) return null;

      return new Routine({
        ...routine,
        completed_today: Boolean(routine.completed_today),
      });
    } catch (error) {
      console.error("❌ Error finding routine by ID:", error);
      throw error;
    }
  }

  // Update routine
  static async update(id, updateData) {
    try {
      await database.run(
        `UPDATE routines 
         SET title = ?, description = ?, icon = ?, tasks = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          updateData.title,
          updateData.description,
          updateData.icon,
          typeof updateData.tasks === "string"
            ? updateData.tasks
            : JSON.stringify(updateData.tasks || []),
          id,
        ]
      );

      return true;
    } catch (error) {
      console.error("❌ Error updating routine:", error);
      throw error;
    }
  }

  // Mark routine as completed
  static async markCompleted(routineId, userId) {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      // Insert completion record
      await database.run(
        `INSERT OR IGNORE INTO routine_completions (routine_id, user_id, completion_date)
         VALUES (?, ?, ?)`,
        [routineId, userId, today]
      );

      // Update timestamp
      await database.run(
        `UPDATE routines SET updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [routineId]
      );

      return true;
    } catch (error) {
      console.error("❌ Error marking routine completed:", error);
      throw error;
    }
  }

  // Delete routine
  static async delete(id) {
    try {
      await database.run("DELETE FROM routines WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.error("❌ Error deleting routine:", error);
      throw error;
    }
  }
}

module.exports = Routine;
