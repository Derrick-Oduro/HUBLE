const db = require("./src/config/database");
const Achievement = require("./src/models/Achievement");

async function migrateDatabase() {
  try {
    await db.connect();
    console.log("✅ Connected to database");

    // Drop old achievements table
    console.log("🗑️ Dropping old achievements table...");
    await db.run("DROP TABLE IF EXISTS user_achievements");
    await db.run("DROP TABLE IF EXISTS achievements");
    console.log("✅ Old tables dropped");

    // Create new tables
    console.log("📝 Creating new achievement tables...");
    await Achievement.createTable();
    console.log("✅ New tables created");

    // Seed achievements
    console.log("🌱 Seeding default achievements...");
    await Achievement.seedDefaults();
    console.log("✅ Achievements seeded successfully");

    console.log("🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateDatabase();
