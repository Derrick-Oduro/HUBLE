const Theme = require("./src/models/Theme");
const Event = require("./src/models/Event");
const database = require("./src/config/database");

async function testTableCreation() {
  try {
    console.log("Connecting to database...");
    await database.connect();
    console.log("✅ Connected");

    console.log("\nCreating Theme table...");
    await Theme.createTable();
    console.log("✅ Theme table created");

    console.log("\nCreating Event table...");
    await Event.createTable();
    console.log("✅ Event table created");

    await database.close();
    console.log("\n✅ All done!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testTableCreation();
