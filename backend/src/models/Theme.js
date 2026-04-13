const db = require("../config/database");

const ALLOWED_UNLOCK_TYPES = new Set([
  "none",
  "level",
  "tasks_completed",
  "streak",
  "focus_minutes",
]);

const ALLOWED_VISUAL_EFFECTS = new Set(["none", "glow"]);

class Theme {
  // Create themes table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS themes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        theme_id TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        colors TEXT NOT NULL,
        unlock_requirement TEXT,
        unlock_level INTEGER DEFAULT 1,
        unlock_type TEXT DEFAULT 'none',
        unlock_value INTEGER DEFAULT 0,
        unlock_achievements TEXT,
        is_premium BOOLEAN DEFAULT 0,
        visual_effect TEXT DEFAULT 'none',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db.run(query);

    const tableInfo = await db.all("PRAGMA table_info(themes)");
    const hasColumn = (name) =>
      tableInfo.some((column) => column.name === name);

    if (!hasColumn("unlock_type")) {
      await db.run(
        "ALTER TABLE themes ADD COLUMN unlock_type TEXT DEFAULT 'none'",
      );
    }

    if (!hasColumn("unlock_value")) {
      await db.run(
        "ALTER TABLE themes ADD COLUMN unlock_value INTEGER DEFAULT 0",
      );
    }

    if (!hasColumn("visual_effect")) {
      await db.run(
        "ALTER TABLE themes ADD COLUMN visual_effect TEXT DEFAULT 'none'",
      );
    }

    await db.run(`
      UPDATE themes
      SET unlock_type = CASE
        WHEN COALESCE(unlock_level, 1) > 1 THEN 'level'
        ELSE 'none'
      END
      WHERE unlock_type IS NULL OR TRIM(unlock_type) = ''
    `);

    await db.run(`
      UPDATE themes
      SET unlock_value = CASE
        WHEN unlock_type = 'level' THEN COALESCE(unlock_level, 1)
        ELSE 0
      END
      WHERE unlock_value IS NULL
    `);

    await db.run(`
      UPDATE themes
      SET visual_effect = 'none'
      WHERE visual_effect IS NULL OR TRIM(visual_effect) = ''
    `);

    const existingThemes = await db.all(
      "SELECT id, category, unlock_type, unlock_value, unlock_level, unlock_requirement FROM themes",
    );

    for (const theme of existingThemes) {
      const normalizedCategory = Theme.normalizeCategory(theme.category);
      const normalizedUnlockType = Theme.normalizeUnlockType(
        theme.unlock_type,
        theme.unlock_level,
      );
      const normalizedUnlockValue = Theme.normalizeUnlockValue(
        theme.unlock_value,
        normalizedUnlockType,
        theme.unlock_level,
      );
      const normalizedRequirement =
        (theme.unlock_requirement || "").trim() ||
        Theme.buildUnlockRequirement(
          normalizedUnlockType,
          normalizedUnlockValue,
        );

      await db.run(
        `
          UPDATE themes
          SET category = ?, unlock_type = ?, unlock_value = ?, unlock_requirement = ?, unlock_level = ?
          WHERE id = ?
        `,
        [
          normalizedCategory,
          normalizedUnlockType,
          normalizedUnlockValue,
          normalizedRequirement,
          normalizedUnlockType === "level" ? normalizedUnlockValue : 1,
          theme.id,
        ],
      );
    }
  }

  static normalizeCategory(category) {
    if (!category || typeof category !== "string") {
      return "Default";
    }

    const normalized = category
      .trim()
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map(
        (part) =>
          `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
      )
      .join(" ");

    return normalized || "Default";
  }

  static normalizeThemeId(themeId, name = "") {
    const raw =
      (typeof themeId === "string" && themeId.trim()) ||
      (typeof name === "string" && name.trim()) ||
      "theme";

    return raw
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");
  }

  static normalizeUnlockType(unlockType, fallbackUnlockLevel = 1) {
    const normalizedType =
      typeof unlockType === "string" ? unlockType.trim().toLowerCase() : "";

    if (ALLOWED_UNLOCK_TYPES.has(normalizedType)) {
      return normalizedType;
    }

    const fallbackLevel = Number(fallbackUnlockLevel) || 1;
    return fallbackLevel > 1 ? "level" : "none";
  }

  static normalizeUnlockValue(
    unlockValue,
    unlockType,
    fallbackUnlockLevel = 1,
  ) {
    const numericUnlockValue = Number(unlockValue);
    const fallbackLevel = Number(fallbackUnlockLevel) || 1;

    if (unlockType === "none") {
      return 0;
    }

    if (!Number.isFinite(numericUnlockValue)) {
      return unlockType === "level" ? Math.max(fallbackLevel, 1) : 1;
    }

    const roundedValue = Math.floor(numericUnlockValue);
    return unlockType === "level"
      ? Math.max(roundedValue, 1)
      : Math.max(roundedValue, 1);
  }

  static buildUnlockRequirement(unlockType, unlockValue) {
    switch (unlockType) {
      case "level":
        return `Reach level ${unlockValue}`;
      case "tasks_completed":
        return `Complete ${unlockValue} tasks`;
      case "streak":
        return `Reach a ${unlockValue}-day streak`;
      case "focus_minutes":
        return `Focus for ${unlockValue} minutes`;
      default:
        return "";
    }
  }

  static normalizeVisualEffect(visualEffect) {
    const normalizedEffect =
      typeof visualEffect === "string"
        ? visualEffect.trim().toLowerCase()
        : "none";
    return ALLOWED_VISUAL_EFFECTS.has(normalizedEffect)
      ? normalizedEffect
      : "none";
  }

  static normalizeThemeData(themeData, existingTheme = null) {
    const resolvedName =
      `${themeData?.name ?? existingTheme?.name ?? ""}`.trim();
    if (!resolvedName) {
      throw new Error("Theme name is required");
    }

    const resolvedThemeId = Theme.normalizeThemeId(
      themeData?.theme_id ?? existingTheme?.theme_id,
      resolvedName,
    );
    if (!resolvedThemeId) {
      throw new Error("Theme ID is required");
    }

    let resolvedColors = themeData?.colors ?? existingTheme?.colors;
    if (typeof resolvedColors === "string") {
      try {
        resolvedColors = JSON.parse(resolvedColors);
      } catch {
        resolvedColors = null;
      }
    }
    if (!resolvedColors || typeof resolvedColors !== "object") {
      throw new Error("Theme colors are required");
    }

    const fallbackUnlockLevel = Number(
      themeData?.unlock_level ?? existingTheme?.unlock_level ?? 1,
    );

    const resolvedUnlockType = Theme.normalizeUnlockType(
      themeData?.unlock_type ?? existingTheme?.unlock_type,
      fallbackUnlockLevel,
    );

    const resolvedUnlockValue = Theme.normalizeUnlockValue(
      themeData?.unlock_value ?? existingTheme?.unlock_value,
      resolvedUnlockType,
      fallbackUnlockLevel,
    );

    const manualRequirement = `${
      themeData?.unlock_requirement ?? existingTheme?.unlock_requirement ?? ""
    }`.trim();

    let resolvedUnlockAchievements =
      themeData?.unlock_achievements ??
      existingTheme?.unlock_achievements ??
      null;
    if (typeof resolvedUnlockAchievements === "string") {
      try {
        resolvedUnlockAchievements = JSON.parse(resolvedUnlockAchievements);
      } catch {
        resolvedUnlockAchievements = null;
      }
    }

    return {
      name: resolvedName,
      theme_id: resolvedThemeId,
      category: Theme.normalizeCategory(
        themeData?.category ?? existingTheme?.category ?? "Default",
      ),
      colors: resolvedColors,
      unlock_type: resolvedUnlockType,
      unlock_value: resolvedUnlockValue,
      unlock_requirement:
        manualRequirement ||
        Theme.buildUnlockRequirement(resolvedUnlockType, resolvedUnlockValue),
      unlock_level: resolvedUnlockType === "level" ? resolvedUnlockValue : 1,
      unlock_achievements: resolvedUnlockAchievements,
      is_premium: Boolean(themeData?.is_premium ?? existingTheme?.is_premium),
      visual_effect: Theme.normalizeVisualEffect(
        themeData?.visual_effect ?? existingTheme?.visual_effect,
      ),
    };
  }

  // Create a new theme
  static async create(themeData) {
    const normalizedTheme = Theme.normalizeThemeData(themeData);

    const {
      name,
      theme_id,
      category,
      colors,
      unlock_requirement,
      unlock_level,
      unlock_type,
      unlock_value,
      unlock_achievements,
      is_premium,
      visual_effect,
    } = normalizedTheme;

    const query = `
      INSERT INTO themes (
        name, theme_id, category, colors, unlock_requirement,
        unlock_level, unlock_type, unlock_value, unlock_achievements, is_premium, visual_effect
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      name,
      theme_id,
      category,
      JSON.stringify(colors),
      unlock_requirement,
      unlock_level,
      unlock_type,
      unlock_value,
      unlock_achievements ? JSON.stringify(unlock_achievements) : null,
      is_premium ? 1 : 0,
      visual_effect,
    ]);

    return { id: result.lastID, ...normalizedTheme };
  }

  // Get all themes
  static async getAll() {
    const query =
      "SELECT * FROM themes WHERE is_active = 1 ORDER BY created_at DESC";

    const rows = await db.all(query);
    return rows.map((row) => ({
      ...row,
      category: Theme.normalizeCategory(row.category),
      colors: JSON.parse(row.colors),
      unlock_type: Theme.normalizeUnlockType(row.unlock_type, row.unlock_level),
      unlock_value: Theme.normalizeUnlockValue(
        row.unlock_value,
        Theme.normalizeUnlockType(row.unlock_type, row.unlock_level),
        row.unlock_level,
      ),
      unlock_requirement:
        (row.unlock_requirement || "").trim() ||
        Theme.buildUnlockRequirement(
          Theme.normalizeUnlockType(row.unlock_type, row.unlock_level),
          Theme.normalizeUnlockValue(
            row.unlock_value,
            Theme.normalizeUnlockType(row.unlock_type, row.unlock_level),
            row.unlock_level,
          ),
        ),
      unlock_achievements: row.unlock_achievements
        ? JSON.parse(row.unlock_achievements)
        : null,
      is_premium: Boolean(row.is_premium),
      visual_effect: Theme.normalizeVisualEffect(row.visual_effect),
      is_active: Boolean(row.is_active),
    }));
  }

  // Get theme by ID
  static async getById(id) {
    const query = "SELECT * FROM themes WHERE id = ?";

    const row = await db.get(query, [id]);
    if (!row) return null;

    return {
      ...row,
      category: Theme.normalizeCategory(row.category),
      colors: JSON.parse(row.colors),
      unlock_type: Theme.normalizeUnlockType(row.unlock_type, row.unlock_level),
      unlock_value: Theme.normalizeUnlockValue(
        row.unlock_value,
        Theme.normalizeUnlockType(row.unlock_type, row.unlock_level),
        row.unlock_level,
      ),
      unlock_requirement:
        (row.unlock_requirement || "").trim() ||
        Theme.buildUnlockRequirement(
          Theme.normalizeUnlockType(row.unlock_type, row.unlock_level),
          Theme.normalizeUnlockValue(
            row.unlock_value,
            Theme.normalizeUnlockType(row.unlock_type, row.unlock_level),
            row.unlock_level,
          ),
        ),
      unlock_achievements: row.unlock_achievements
        ? JSON.parse(row.unlock_achievements)
        : null,
      is_premium: Boolean(row.is_premium),
      visual_effect: Theme.normalizeVisualEffect(row.visual_effect),
      is_active: Boolean(row.is_active),
    };
  }

  // Update theme
  static async update(id, themeData) {
    const existingTheme = await Theme.getById(id);
    if (!existingTheme) {
      throw new Error("Theme not found");
    }

    const normalizedTheme = Theme.normalizeThemeData(themeData, existingTheme);

    const {
      name,
      category,
      colors,
      unlock_requirement,
      unlock_level,
      unlock_type,
      unlock_value,
      unlock_achievements,
      is_premium,
      visual_effect,
    } = normalizedTheme;

    const query = `
      UPDATE themes
      SET name = ?, category = ?, colors = ?, unlock_requirement = ?,
          unlock_level = ?, unlock_type = ?, unlock_value = ?, unlock_achievements = ?, is_premium = ?, visual_effect = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.run(query, [
      name,
      category,
      JSON.stringify(colors),
      unlock_requirement,
      unlock_level,
      unlock_type,
      unlock_value,
      unlock_achievements ? JSON.stringify(unlock_achievements) : null,
      is_premium ? 1 : 0,
      visual_effect,
      id,
    ]);

    return { id, ...normalizedTheme };
  }

  // Delete theme (soft delete)
  static async delete(id) {
    const query =
      "UPDATE themes SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

    await db.run(query, [id]);
  }

  // Hard delete theme
  static async hardDelete(id) {
    const query = "DELETE FROM themes WHERE id = ?";

    await db.run(query, [id]);
  }

  static async seedDefaults() {
    const defaultThemes = [
      {
        name: "Dark Theme",
        theme_id: "dark",
        category: "Default",
        colors: {
          background: "#111827",
          card: "#1F2937",
          cardSecondary: "#374151",
          accent: "#8B5CF6",
          text: "#FFFFFF",
          textSecondary: "#9CA3AF",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
        unlock_requirement: null,
        unlock_level: 1,
        is_premium: 0,
      },
      {
        name: "Light Theme",
        theme_id: "light",
        category: "Default",
        colors: {
          background: "#F9FAFB",
          card: "#FFFFFF",
          cardSecondary: "#F3F4F6",
          accent: "#8B5CF6",
          text: "#111827",
          textSecondary: "#6B7280",
          success: "#059669",
          warning: "#D97706",
          error: "#DC2626",
        },
        unlock_requirement: null,
        unlock_level: 1,
        is_premium: 0,
      },
      {
        name: "Ocean Blue",
        theme_id: "ocean",
        category: "Nature",
        colors: {
          background: "#0C4A6E",
          card: "#0369A1",
          cardSecondary: "#0284C7",
          accent: "#06B6D4",
          text: "#FFFFFF",
          textSecondary: "#BAE6FD",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
        unlock_requirement: null,
        unlock_level: 1,
        is_premium: 0,
      },
      {
        name: "Forest Green",
        theme_id: "forest",
        category: "Nature",
        colors: {
          background: "#14532D",
          card: "#166534",
          cardSecondary: "#15803D",
          accent: "#10B981",
          text: "#FFFFFF",
          textSecondary: "#BBF7D0",
          success: "#059669",
          warning: "#F59E0B",
          error: "#EF4444",
        },
        unlock_requirement: null,
        unlock_level: 1,
        is_premium: 0,
      },
      {
        name: "Sunset Orange",
        theme_id: "sunset",
        category: "Vibrant",
        colors: {
          background: "#9A3412",
          card: "#C2410C",
          cardSecondary: "#EA580C",
          accent: "#F59E0B",
          text: "#FFFFFF",
          textSecondary: "#FED7AA",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
        unlock_requirement: "Reach level 10",
        unlock_level: 10,
        is_premium: 0,
      },
      {
        name: "Royal Purple",
        theme_id: "royal",
        category: "Premium",
        colors: {
          background: "#581C87",
          card: "#7C3AED",
          cardSecondary: "#8B5CF6",
          accent: "#A855F7",
          text: "#FFFFFF",
          textSecondary: "#DDD6FE",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
        unlock_requirement: "Complete 50 tasks",
        unlock_level: 10,
        is_premium: 1,
      },
      {
        name: "Cyber Neon",
        theme_id: "cyber",
        category: "Special",
        colors: {
          background: "#0A0A0A",
          card: "#1A1A1A",
          cardSecondary: "#2A2A2A",
          accent: "#00FF88",
          text: "#FFFFFF",
          textSecondary: "#88FF0088",
          success: "#00FF88",
          warning: "#FFD700",
          error: "#FF0040",
        },
        unlock_requirement: "Join 5 challenges",
        unlock_level: 15,
        is_premium: 1,
      },
      {
        name: "Rose Gold",
        theme_id: "rose",
        category: "Elegant",
        colors: {
          background: "#FDF2F8",
          card: "#FFEEF6",
          cardSecondary: "#FCE7F3",
          accent: "#EC4899",
          text: "#831843",
          textSecondary: "#BE185D",
          success: "#059669",
          warning: "#D97706",
          error: "#DC2626",
        },
        unlock_requirement: "Earn 3 group badges",
        unlock_level: 12,
        is_premium: 1,
      },
      {
        name: "Paper Theme",
        theme_id: "paper",
        category: "Elegant",
        colors: {
          background: "#FEFCF7",
          card: "#FFFEF9",
          cardSecondary: "#F8F6F0",
          accent: "#2C2C2E",
          text: "#1C1C1E",
          textSecondary: "#48484A",
          success: "#4A5D23",
          warning: "#8B4513",
          error: "#8B1A1A",
        },
        unlock_requirement: null,
        unlock_level: 1,
        is_premium: 0,
      },
      {
        name: "Vintage Paper",
        theme_id: "vintage-paper",
        category: "Premium",
        colors: {
          background: "#F5F2E8",
          card: "#F9F6EC",
          cardSecondary: "#F0EDE1",
          accent: "#1F1F1F",
          text: "#2F2F2F",
          textSecondary: "#5C5C5C",
          success: "#355C2B",
          warning: "#A0620E",
          error: "#7A1A1A",
        },
        unlock_requirement: "Reach level 10",
        unlock_level: 10,
        is_premium: 1,
      },
      {
        name: "Notebook Paper",
        theme_id: "notebook",
        category: "Default",
        colors: {
          background: "#FDFDFD",
          card: "#FFFFFF",
          cardSecondary: "#F7F7F7",
          accent: "#1E3A8A",
          text: "#1A1A1A",
          textSecondary: "#4D4D4D",
          success: "#166534",
          warning: "#B45309",
          error: "#DC2626",
        },
        unlock_requirement: null,
        unlock_level: 1,
        is_premium: 0,
      },
      {
        name: "Christmas Theme",
        theme_id: "christmas",
        category: "Default",
        colors: {
          background: "#FFFFFF",
          card: "#FEFEFE",
          cardSecondary: "#F8F9FA",
          accent: "#B91C1C",
          text: "#1F2937",
          textSecondary: "#6B7280",
          success: "#047857",
          warning: "#92400E",
          error: "#7C2D12",
        },
        unlock_requirement: null,
        unlock_level: 1,
        is_premium: 0,
      },
      {
        name: "Solo Leveling",
        theme_id: "solo-leveling",
        category: "Special",
        colors: {
          background: "#0A0A0F",
          card: "#1A1A2E",
          cardSecondary: "#16213E",
          accent: "#6C5CE7",
          text: "#E6E6FA",
          textSecondary: "#9CA3AF",
          success: "#00D9FF",
          warning: "#FFD700",
          error: "#FF6B6B",
        },
        unlock_requirement: null,
        unlock_level: 1,
        is_premium: 0,
      },
    ];

    for (const theme of defaultThemes) {
      const normalizedTheme = Theme.normalizeThemeData(theme);

      await db.run(
        `INSERT OR IGNORE INTO themes (
          name, theme_id, category, colors, unlock_requirement,
          unlock_level, unlock_type, unlock_value, is_premium, visual_effect
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          normalizedTheme.name,
          normalizedTheme.theme_id,
          normalizedTheme.category,
          JSON.stringify(normalizedTheme.colors),
          normalizedTheme.unlock_requirement,
          normalizedTheme.unlock_level,
          normalizedTheme.unlock_type,
          normalizedTheme.unlock_value,
          normalizedTheme.is_premium ? 1 : 0,
          normalizedTheme.visual_effect,
        ],
      );
    }
  }
}

module.exports = Theme;
