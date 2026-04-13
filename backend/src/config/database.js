const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.resolve(process.cwd(), "data", "huble.db");
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
          } catch (_error) {
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
        (column) => column.name === "level",
      );

      if (!hasLevelColumn) {
        console.log(
          "❌ user_stats table missing required columns, recreating...",
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

  async fixUsersTable() {
    try {
      console.log("🔧 Fixing users table...");
      const tableInfo = await this.all("PRAGMA table_info(users)");

      const columnsToAdd = [
        {
          name: "avatar_color",
          sql: `ALTER TABLE users ADD COLUMN avatar_color TEXT DEFAULT '#8B5CF6'`,
        },
        {
          name: "avatar_border",
          sql: `ALTER TABLE users ADD COLUMN avatar_border TEXT DEFAULT 'normal'`,
        },
      ];

      for (const column of columnsToAdd) {
        const exists = tableInfo.some((info) => info.name === column.name);
        if (!exists) {
          await this.run(column.sql);
          console.log(`✅ Added users column: ${column.name}`);
        }
      }
    } catch (error) {
      console.error("❌ Error fixing users table:", error);
      throw error;
    }
  }

  async fixPartiesTable() {
    try {
      console.log("🔧 Fixing parties table...");
      const tableInfo = await this.all("PRAGMA table_info(parties)");

      const hasColumn = (columnName) =>
        tableInfo.some((column) => column.name === columnName);

      const columnsToAdd = [
        {
          name: "emoji",
          sql: "ALTER TABLE parties ADD COLUMN emoji TEXT DEFAULT '🎉'",
        },
        {
          name: "color",
          sql: "ALTER TABLE parties ADD COLUMN color TEXT DEFAULT '#8B5CF6'",
        },
        {
          name: "progress",
          sql: "ALTER TABLE parties ADD COLUMN progress INTEGER DEFAULT 0",
        },
        {
          name: "type",
          sql: "ALTER TABLE parties ADD COLUMN type TEXT DEFAULT 'cooperative'",
        },
        {
          name: "weekly_goal_label",
          sql: "ALTER TABLE parties ADD COLUMN weekly_goal_label TEXT DEFAULT 'Weekly team goal'",
        },
        {
          name: "weekly_goal_target",
          sql: "ALTER TABLE parties ADD COLUMN weekly_goal_target INTEGER DEFAULT 10",
        },
      ];

      for (const column of columnsToAdd) {
        if (!hasColumn(column.name)) {
          await this.run(column.sql);
          console.log(`✅ Added parties column: ${column.name}`);
        }
      }

      if (!hasColumn("created_by") && hasColumn("creator_id")) {
        await this.run("ALTER TABLE parties ADD COLUMN created_by INTEGER");
        await this.run(
          "UPDATE parties SET created_by = creator_id WHERE created_by IS NULL",
        );
        console.log("✅ Backfilled parties.created_by from creator_id");
      }

      if (!hasColumn("privacy")) {
        await this.run(
          "ALTER TABLE parties ADD COLUMN privacy TEXT DEFAULT 'public'",
        );
        console.log("✅ Added parties column: privacy");
      }
    } catch (error) {
      console.error("❌ Error fixing parties table:", error);
      throw error;
    }
  }

  async fixChallengesTable() {
    try {
      console.log("🔧 Fixing challenges table...");
      const tableInfo = await this.all("PRAGMA table_info(challenges)");

      const hasColumn = (columnName) =>
        tableInfo.some((column) => column.name === columnName);

      const columnsToAdd = [
        {
          name: "emoji",
          sql: "ALTER TABLE challenges ADD COLUMN emoji TEXT DEFAULT '🏆'",
        },
        {
          name: "color",
          sql: "ALTER TABLE challenges ADD COLUMN color TEXT DEFAULT '#8B5CF6'",
        },
        {
          name: "difficulty",
          sql: "ALTER TABLE challenges ADD COLUMN difficulty TEXT DEFAULT 'Medium'",
        },
        {
          name: "reward",
          sql: "ALTER TABLE challenges ADD COLUMN reward TEXT",
        },
        {
          name: "goal_value",
          sql: "ALTER TABLE challenges ADD COLUMN goal_value INTEGER",
        },
        {
          name: "goal_type",
          sql: "ALTER TABLE challenges ADD COLUMN goal_type TEXT DEFAULT 'count'",
        },
        {
          name: "mode",
          sql: "ALTER TABLE challenges ADD COLUMN mode TEXT DEFAULT 'competitive'",
        },
        {
          name: "team_target",
          sql: "ALTER TABLE challenges ADD COLUMN team_target INTEGER",
        },
      ];

      for (const column of columnsToAdd) {
        if (!hasColumn(column.name)) {
          await this.run(column.sql);
          console.log(`✅ Added challenges column: ${column.name}`);
        }
      }

      if (hasColumn("target_value")) {
        await this.run(
          "UPDATE challenges SET goal_value = COALESCE(goal_value, target_value) WHERE goal_value IS NULL",
        );
      }

      await this.run(
        "UPDATE challenges SET team_target = COALESCE(team_target, goal_value, target_value, 0) WHERE team_target IS NULL",
      );

      await this.run(
        "UPDATE challenges SET mode = 'competitive' WHERE mode IS NULL OR TRIM(mode) = ''",
      );

      if (hasColumn("reward_xp") && hasColumn("reward_coins")) {
        await this.run(`
          UPDATE challenges
          SET reward = CASE
            WHEN reward IS NOT NULL AND TRIM(reward) != '' THEN reward
            WHEN COALESCE(reward_xp, 0) > 0 AND COALESCE(reward_coins, 0) > 0 THEN '⭐ ' || reward_xp || ' XP + 💰 ' || reward_coins || ' Coins'
            WHEN COALESCE(reward_xp, 0) > 0 THEN '⭐ ' || reward_xp || ' XP'
            WHEN COALESCE(reward_coins, 0) > 0 THEN '💰 ' || reward_coins || ' Coins'
            ELSE 'Challenge reward'
          END
        `);
      }
    } catch (error) {
      console.error("❌ Error fixing challenges table:", error);
      throw error;
    }
  }

  async fixChallengeParticipantsTable() {
    try {
      console.log("🔧 Fixing challenge_participants table...");
      const tableInfo = await this.all(
        "PRAGMA table_info(challenge_participants)",
      );

      const hasColumn = (columnName) =>
        tableInfo.some((column) => column.name === columnName);

      if (!hasColumn("updated_at")) {
        await this.run(
          "ALTER TABLE challenge_participants ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        );
        console.log("✅ Added challenge_participants column: updated_at");
      }

      if (!hasColumn("completed")) {
        await this.run(
          "ALTER TABLE challenge_participants ADD COLUMN completed BOOLEAN DEFAULT 0",
        );
        console.log("✅ Added challenge_participants column: completed");
      }
    } catch (error) {
      console.error("❌ Error fixing challenge_participants table:", error);
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

      // Achievements definition table
      `CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        requirement_type TEXT NOT NULL,
        requirement_value INTEGER NOT NULL,
        xp_reward INTEGER DEFAULT 0,
        coin_reward INTEGER DEFAULT 0,
        unlock_level INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // User achievements progress table
      `CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id INTEGER NOT NULL,
        progress INTEGER DEFAULT 0,
        unlocked BOOLEAN DEFAULT 0,
        unlocked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        UNIQUE(user_id, achievement_id)
      )`,

      // Activity feed table
      `CREATE TABLE IF NOT EXISTS activity_feed (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Activity cheers table
      `CREATE TABLE IF NOT EXISTS activity_cheers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activity_feed(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(activity_id, user_id)
      )`,

      // Password reset tokens table
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

      // Friends table
      `CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'blocked')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, friend_id)
      )`,

      // Parties table
      `CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        emoji TEXT DEFAULT '🎉',
        color TEXT DEFAULT '#8B5CF6',
        type TEXT DEFAULT 'cooperative',
        goal TEXT,
        weekly_goal_label TEXT DEFAULT 'Weekly team goal',
        weekly_goal_target INTEGER DEFAULT 10,
        progress INTEGER DEFAULT 0,
        privacy TEXT NOT NULL DEFAULT 'public' CHECK(privacy IN ('public', 'private')),
        max_members INTEGER DEFAULT 10,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Party members table
      `CREATE TABLE IF NOT EXISTS party_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        party_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin', 'member')),
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(party_id, user_id)
      )`,

      // Weekly party contributions
      `CREATE TABLE IF NOT EXISTS party_contributions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        party_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        week_key TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(party_id, user_id, week_key)
      )`,

      // Party invitations table
      `CREATE TABLE IF NOT EXISTS party_invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        party_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        invited_by INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(party_id, user_id)
      )`,

      // Challenges table
      `CREATE TABLE IF NOT EXISTS challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        emoji TEXT DEFAULT '🏆',
        color TEXT DEFAULT '#8B5CF6',
        difficulty TEXT DEFAULT 'Medium',
        reward TEXT,
        type TEXT NOT NULL CHECK(type IN ('streak', 'total', 'speed')),
        target_value INTEGER,
        goal_value INTEGER,
        goal_type TEXT DEFAULT 'count',
        mode TEXT DEFAULT 'competitive',
        team_target INTEGER,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reward_xp INTEGER DEFAULT 0,
        reward_coins INTEGER DEFAULT 0,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )`,

      // Challenge participants table
      `CREATE TABLE IF NOT EXISTS challenge_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(challenge_id, user_id)
      )`,
    ];

    for (const tableSQL of tables) {
      try {
        await this.run(tableSQL);
        const tableName = tableSQL.match(
          /CREATE TABLE IF NOT EXISTS (\w+)/,
        )?.[1];
        console.log(`✅ Table created/verified (${tableName})`);
      } catch (error) {
        console.error("❌ Error creating table:", error);
        throw error;
      }
    }

    await this.fixUsersTable();
    await this.fixPartiesTable();
    await this.fixChallengesTable();
    await this.fixChallengeParticipantsTable();

    // Fix user_stats table separately
    await this.fixUserStatsTable();

    const Theme = require("../models/Theme");
    const AvatarOption = require("../models/AvatarOption");

    await Theme.createTable();
    await AvatarOption.createTable();
    await Theme.seedDefaults();
    await AvatarOption.seedDefaults();
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
