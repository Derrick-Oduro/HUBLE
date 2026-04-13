const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/huble.db");

db.all(
  "SELECT id, username, email, role, created_at FROM admins",
  [],
  (err, rows) => {
    if (err) {
      console.error("Error:", err);
    } else if (rows.length === 0) {
      console.log("❌ No admins found in database");
    } else {
      console.log("✅ Admins in database:");
      rows.forEach((admin) => {
        console.log(`   ID: ${admin.id}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.created_at}`);
        console.log("   ---");
      });
    }
    db.close();
  },
);
