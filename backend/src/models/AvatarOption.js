const db = require("../config/database");

class AvatarOption {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS avatar_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emoji TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unlock_level INTEGER DEFAULT 1,
        is_premium BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db.run(query);
  }

  static async seedDefaults() {
    const avatarOptions = [
      {
        emoji: "🧙‍♂️",
        name: "Wizard",
        category: "Starter",
        unlock_level: 1,
        is_premium: 0,
      },
      {
        emoji: "🧙‍♀️",
        name: "Sorceress",
        category: "Starter",
        unlock_level: 1,
        is_premium: 0,
      },
      {
        emoji: "👨‍💻",
        name: "Developer",
        category: "Tech",
        unlock_level: 3,
        is_premium: 0,
      },
      {
        emoji: "👩‍💻",
        name: "Coder",
        category: "Tech",
        unlock_level: 3,
        is_premium: 0,
      },
      {
        emoji: "🦸‍♂️",
        name: "Hero",
        category: "Hero",
        unlock_level: 5,
        is_premium: 0,
      },
      {
        emoji: "🦸‍♀️",
        name: "Heroine",
        category: "Hero",
        unlock_level: 5,
        is_premium: 0,
      },
      {
        emoji: "🥷",
        name: "Ninja",
        category: "Elite",
        unlock_level: 10,
        is_premium: 0,
      },
      {
        emoji: "🤴",
        name: "Prince",
        category: "Royal",
        unlock_level: 15,
        is_premium: 0,
      },
      {
        emoji: "👸",
        name: "Princess",
        category: "Royal",
        unlock_level: 15,
        is_premium: 0,
      },
      {
        emoji: "🧠",
        name: "Mastermind",
        category: "Elite",
        unlock_level: 20,
        is_premium: 0,
      },
      {
        emoji: "⚡",
        name: "Lightning",
        category: "Special",
        unlock_level: 25,
        is_premium: 1,
      },
      {
        emoji: "🔥",
        name: "Fire Master",
        category: "Special",
        unlock_level: 30,
        is_premium: 1,
      },
    ];

    for (const avatarOption of avatarOptions) {
      await db.run(
        `INSERT OR IGNORE INTO avatar_options (
          emoji, name, category, unlock_level, is_premium
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          avatarOption.emoji,
          avatarOption.name,
          avatarOption.category,
          avatarOption.unlock_level,
          avatarOption.is_premium,
        ],
      );
    }
  }

  static async getAll() {
    return db.all(
      "SELECT * FROM avatar_options WHERE is_active = 1 ORDER BY unlock_level ASC, id ASC",
    );
  }
}

module.exports = AvatarOption;
