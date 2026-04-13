const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/huble.db");

db.all(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log("All tables in database:");
      rows.forEach((row) => console.log(" -", row.name));

      const adminTables = rows.filter(
        (r) =>
          r.name.includes("admin") ||
          r.name.includes("theme") ||
          r.name.includes("event"),
      );
      console.log(
        "\nAdmin-related tables:",
        adminTables.length > 0
          ? adminTables.map((t) => t.name).join(", ")
          : "NONE",
      );
    }
    db.close();
  },
);
