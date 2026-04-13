const database = require("./src/config/database");
const Admin = require("./src/models/Admin");

async function createAdmin() {
  try {
    await database.connect();
    console.log("Database connected");

    const admins = await Admin.getAll();
    console.log("Current admin count:", admins.length);

    if (admins.length > 0) {
      console.log("❌ Admin already exists!");
      await database.close();
      process.exit(1);
    }

    console.log("Creating first admin...");
    const admin = await Admin.create(
      "admin",
      "admin@huble.com",
      "Admin@123",
      "super-admin",
    );

    console.log("✅ Admin created successfully!");
    console.log("ID:", admin.id);
    console.log("Username:", admin.username);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    await database.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createAdmin();
