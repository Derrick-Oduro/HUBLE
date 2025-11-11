const database = require("../config/database");

class FocusSession {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.session_type = data.session_type;
    this.duration_planned = data.duration_planned;
    this.duration_actual = data.duration_actual;
    this.habit_id = data.habit_id;
    this.focus_topic = data.focus_topic;
    this.completed = data.completed;
    this.experience_gained = data.experience_gained;
    this.coins_gained = data.coins_gained;
    this.created_at = data.created_at;
  }

  // Create new focus session
  static async create(sessionData) {
    try {
      console.log("🔄 Creating focus session in database:", sessionData);

      const result = await database.run(
        `INSERT INTO focus_sessions (
          user_id, session_type, duration_planned, duration_actual, 
          habit_id, focus_topic, completed, experience_gained, coins_gained
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionData.user_id,
          sessionData.session_type,
          sessionData.duration_planned,
          sessionData.duration_actual,
          sessionData.habit_id,
          sessionData.focus_topic,
          sessionData.completed ? 1 : 0,
          sessionData.experience_gained,
          sessionData.coins_gained,
        ]
      );

      console.log("✅ Focus session created with ID:", result.lastID);
      return result.lastID;
    } catch (error) {
      console.error("❌ Error creating focus session:", error);
      throw error;
    }
  }

  // Find sessions by user ID
  static async findByUserId(userId, period) {
    try {
      let whereClause = "WHERE user_id = ?";
      let params = [userId];

      if (period === "today") {
        whereClause += ` AND date(created_at) = date('now')`;
      } else if (period === "week") {
        whereClause += ` AND created_at >= date('now', '-7 days')`;
      } else if (period === "month") {
        whereClause += ` AND created_at >= date('now', '-30 days')`;
      }

      const sessions = await database.all(
        `SELECT * FROM focus_sessions 
         ${whereClause}
         ORDER BY created_at DESC`,
        params
      );

      return sessions.map(
        (session) =>
          new FocusSession({
            ...session,
            completed: Boolean(session.completed),
          })
      );
    } catch (error) {
      console.error("❌ Error finding focus sessions:", error);
      throw error;
    }
  }

  // Find session by ID
  static async findById(id) {
    try {
      const session = await database.get(
        "SELECT * FROM focus_sessions WHERE id = ?",
        [id]
      );

      if (!session) return null;

      return new FocusSession({
        ...session,
        completed: Boolean(session.completed),
      });
    } catch (error) {
      console.error("❌ Error finding focus session by ID:", error);
      throw error;
    }
  }

  // Save user preferences
  static async savePreferences(preferencesData) {
    try {
      console.log("🔄 Saving focus preferences:", preferencesData);

      await database.run(
        `INSERT OR REPLACE INTO focus_preferences (
          user_id, work_duration, short_break, long_break, 
          auto_start, sound_enabled, vibration_enabled, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          preferencesData.user_id,
          preferencesData.work_duration,
          preferencesData.short_break,
          preferencesData.long_break,
          preferencesData.auto_start ? 1 : 0,
          preferencesData.sound_enabled ? 1 : 0,
          preferencesData.vibration_enabled ? 1 : 0,
        ]
      );

      console.log("✅ Focus preferences saved successfully");
      return true;
    } catch (error) {
      console.error("❌ Error saving focus preferences:", error);
      throw error;
    }
  }

  // Get user preferences
  static async getPreferences(userId) {
    try {
      console.log("🔍 Getting focus preferences for user:", userId);

      const preferences = await database.get(
        "SELECT * FROM focus_preferences WHERE user_id = ?",
        [userId]
      );

      if (!preferences) {
        console.log("📝 No preferences found, returning defaults");
        return null;
      }

      const result = {
        ...preferences,
        auto_start: Boolean(preferences.auto_start),
        sound_enabled: Boolean(preferences.sound_enabled),
        vibration_enabled: Boolean(preferences.vibration_enabled),
      };

      console.log("✅ Found preferences:", result);
      return result;
    } catch (error) {
      console.error("❌ Error getting focus preferences:", error);
      throw error;
    }
  }
}

module.exports = FocusSession;
