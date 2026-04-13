const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const dbPath = path.join(__dirname, "data", "huble.db");
const db = new sqlite3.Database(dbPath);

async function createFirstAdmin() {
  console.log("🔧 Creating first admin account...\n");

  // Check if admin already exists
  db.get("SELECT COUNT(*) as count FROM admins", [], async (err, row) => {
    if (err) {
      console.error("❌ Error checking admins:", err);
      db.close();
      return;
    }

    if (row.count > 0) {
      console.log("❌ Admin account already exists!");
      console.log("Use existing credentials to login.\n");
      db.close();
      return;
    }

    // Create admin
    const username = "admin";
    const email = "admin@huble.com";
    const password = "Admin@123";
    const role = "super-admin";

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        "INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, role],
        function (err) {
          if (err) {
            console.error("❌ Error creating admin:", err);
          } else {
            console.log("✅ Admin account created successfully!\n");
            console.log("📋 Login Credentials:");
            console.log("   URL: http://localhost:3000/admin");
            console.log("   Email:", email);
            console.log("   Password:", password);
            console.log("\n🚀 You can now access the admin panel!");
          }
          db.close();
        },
      );
    } catch (error) {
      console.error("❌ Error hashing password:", error);
      db.close();
    }
  });
}

createFirstAdmin();
