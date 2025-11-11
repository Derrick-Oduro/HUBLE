const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, "../../data/huble.db");
  }

  async connect() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(this.dbPath, (err) => {
          if (err) {
            console.error("Error opening database:", err.message);
            reject(err);
          } else {
            console.log("Connected to SQLite database");
            this.initializeTables()
              .then(() => resolve())
              .catch(reject);
          }
        });
      });
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }

  async migrateDailiesTable() {
    try {
      console.log("🔄 Migrating dailies table...");

      // Check if the table has the new columns
      const tableInfo = await this.all("PRAGMA table_info(dailies)");
      const hasNewColumns = tableInfo.some((col) => col.name === "priority");

      if (!hasNewColumns) {
        console.log("📝 Adding missing columns to dailies table...");

        // Add missing columns one by one
        const columnsToAdd = [
          `ALTER TABLE dailies ADD COLUMN priority TEXT DEFAULT "medium"`,
          `ALTER TABLE dailies ADD COLUMN category TEXT DEFAULT "General"`,
          `ALTER TABLE dailies ADD COLUMN due_date TEXT`,
          `ALTER TABLE dailies ADD COLUMN tags TEXT DEFAULT "[]"`,
        ];

        for (const sql of columnsToAdd) {
          try {
            await this.run(sql);
            console.log("✅ Added column:", sql.split(" ")[4]);
          } catch (error) {
            // Column might already exist, that's okay
            console.log("⚠️ Column might already exist:", sql.split(" ")[4]);
          }
        }

        console.log("✅ Dailies table migration completed");
      } else {
        console.log("✅ Dailies table already has required columns");
      }
    } catch (error) {
      console.error("❌ Error migrating dailies table:", error);
    }
  }

  // Add this method to fix the user_stats table
  async fixUserStatsTable() {
    try {
      console.log("🔧 Fixing user_stats table...");

      // Check if table exists and get its structure
      const tableInfo = await this.all("PRAGMA table_info(user_stats)");
      console.log("📋 Current user_stats table structure:", tableInfo);

      // Check if level column exists
      const hasLevelColumn = tableInfo.some(
        (column) => column.name === "level"
      );

      if (!hasLevelColumn) {
        console.log(
          "❌ user_stats table missing required columns, recreating..."
        );

        // Drop the existing table
        await this.run("DROP TABLE IF EXISTS user_stats");
        console.log("🗑️ Dropped old user_stats table");

        // Create the new table with correct structure
        await this.run(`CREATE TABLE user_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          level INTEGER DEFAULT 1,
          experience INTEGER DEFAULT 0,
          health INTEGER DEFAULT 100,
          coins_earned INTEGER DEFAULT 0,
          gems_earned INTEGER DEFAULT 0,
          current_streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          total_tasks_completed INTEGER DEFAULT 0,
          focus_minutes INTEGER DEFAULT 0,
          focus_sessions INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        console.log("✅ Created new user_stats table with correct structure");
      } else {
        console.log("✅ user_stats table already has correct structure");
      }
    } catch (error) {
      console.error("❌ Error fixing user_stats table:", error);
      throw error;
    }
  }

  async initializeTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        max_experience INTEGER DEFAULT 100,
        health INTEGER DEFAULT 100,
        max_health INTEGER DEFAULT 100,
        coins INTEGER DEFAULT 0,
        gems INTEGER DEFAULT 0,
        avatar TEXT DEFAULT '😊',
        theme TEXT DEFAULT 'dark',
        total_tasks_completed INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Habits table
      `CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        difficulty TEXT DEFAULT 'medium',
        color TEXT DEFAULT '#3B82F6',
        target_days TEXT DEFAULT '[1,2,3,4,5,6,0]',
        streak INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Habit completions table
      `CREATE TABLE IF NOT EXISTS habit_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        completion_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(habit_id, completion_date)
      )`,

      // Dailies table
      `CREATE TABLE IF NOT EXISTS dailies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        difficulty TEXT DEFAULT 'medium',
        category TEXT DEFAULT 'General',
        due_date TEXT,
        tags TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Daily completions table
      `CREATE TABLE IF NOT EXISTS daily_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        completion_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(daily_id, completion_date),
        FOREIGN KEY (daily_id) REFERENCES dailies(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Routines table
      `CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'list-outline',
        tasks TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Routine completions table
      `CREATE TABLE IF NOT EXISTS routine_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        completion_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(routine_id, completion_date)
      )`,

      // Focus sessions table
      `CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_type TEXT NOT NULL, -- 'work', 'break', 'custom'
        duration_planned INTEGER NOT NULL, -- in seconds
        duration_actual INTEGER NOT NULL, -- in seconds
        habit_id INTEGER, -- if linked to a habit
        focus_topic TEXT, -- what they focused on
        completed BOOLEAN DEFAULT 1,
        experience_gained INTEGER DEFAULT 0,
        coins_gained INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE SET NULL
      )`,

      // Achievements table
      `CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_type TEXT NOT NULL,
        achievement_name TEXT NOT NULL,
        description TEXT,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Focus preferences table
      `CREATE TABLE IF NOT EXISTS focus_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        work_duration INTEGER DEFAULT 1500,
        short_break INTEGER DEFAULT 300,
        long_break INTEGER DEFAULT 900,
        auto_start BOOLEAN DEFAULT 0,
        sound_enabled BOOLEAN DEFAULT 1,
        vibration_enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    ];

    for (const tableSQL of tables) {
      try {
        await this.run(tableSQL);
        const tableName = tableSQL.match(
          /CREATE TABLE IF NOT EXISTS (\w+)/
        )?.[1];
        console.log(`✅ Table created/verified (${tableName})`);
      } catch (error) {
        console.error("❌ Error creating table:", error);
        throw error;
      }
    }

    // Fix user_stats table separately
    await this.fixUserStatsTable();
  }

  // Promisify database methods
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.error("Database run error:", err.message);
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.error("Database get error:", err.message);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("Database all error:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error("Error closing database:", err.message);
            reject(err);
          } else {
            console.log("Database connection closed");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Transaction support
  async transaction(callback) {
    try {
      await this.run("BEGIN TRANSACTION");
      const result = await callback();
      await this.run("COMMIT");
      return result;
    } catch (error) {
      await this.run("ROLLBACK");
      throw error;
    }
  }
}

// Create and export singleton instance
const database = new Database();

module.exports = database;
