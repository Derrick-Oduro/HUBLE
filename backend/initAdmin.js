const Admin = require("./src/models/Admin");
const Theme = require("./src/models/Theme");
const Event = require("./src/models/Event");
const database = require("./src/config/database");

async function initializeAdminTables() {
  try {
    console.log("🔧 Initializing admin tables...");

    // Connect to database first
    await database.connect();
    console.log("✅ Database connected");

    // Create tables
    await Admin.createTable();
    console.log("✅ Admin table created");

    await Theme.createTable();
    console.log("✅ Themes table created");

    await Event.createTable();
    console.log("✅ Events table created");

    console.log("\n✅ All admin tables initialized successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Start the server: npm start");
    console.log("2. Create your first admin account:");
    console.log(
      "   POST http://localhost:3000/api/admin/auth/create-first-admin",
    );
    console.log(
      '   Body: { "username": "admin", "email": "admin@huble.com", "password": "yourpassword" }',
    );
    console.log("\n3. Login to admin panel:");
    console.log("   POST http://localhost:3000/api/admin/auth/login");
    console.log(
      '   Body: { "email": "admin@huble.com", "password": "yourpassword" }',
    );

    await database.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing admin tables:", error);
    process.exit(1);
  }
}

initializeAdminTables();
