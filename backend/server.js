require("dotenv").config();
const app = require("./src/app");
const database = require("./src/config/database");
const Achievement = require("./src/models/Achievement");
const os = require("os");

const PORT = process.env.PORT || 3000;

// Get the actual network IP dynamically
const getNetworkIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === "IPv4" && !interface.internal) {
        return interface.address;
      }
    }
  }
  return "localhost";
};

const networkIP = getNetworkIP();

// Start server only after database is connected
const startServer = async () => {
  try {
    // Wait for database to connect first
    await database.connect();
    console.log("✅ Database connected successfully");

    // Seed default achievements
    try {
      await Achievement.createTable();
      await Achievement.seedDefaults();
      console.log("✅ Default achievements seeded");
    } catch (error) {
      console.log(
        "⚠️ Achievements already exist or error seeding:",
        error.message,
      );
    }

    // Then start listening on all network interfaces (0.0.0.0)
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 HUBLE Backend Server Started!`);
      console.log(`📍 Local access: http://localhost:${PORT}`);
      console.log(`🌐 Network access: http://${networkIP}:${PORT}`);
      console.log(`🏥 Health check: http://${networkIP}:${PORT}/health`);
      console.log(`📱 Use this IP in your frontend: ${networkIP}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  console.error(err.stack);
  process.exit(1);
});
