const database = require("./src/config/database");

async function testEventTable() {
  try {
    await database.connect();
    console.log("✅ Connected");

    const query = `
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        rewards TEXT,
        requirements TEXT,
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Creating events table without foreign key...");
    await database.run(query);
    console.log("✅ Events table created successfully!");

    await database.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testEventTable();
