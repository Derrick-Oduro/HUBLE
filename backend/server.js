require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, HOST, () => {
  console.log("🚀 HUBLE Backend Server Started!");
  console.log(`📍 Server running on http://${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📚 API Base URL: http://${HOST}:${PORT}/api`);
  console.log("📱 Ready for mobile app connections!");

  if (process.env.NODE_ENV !== "production") {
    console.log("\n🔧 Available endpoints:");
    console.log("   POST /api/auth/register");
    console.log("   POST /api/auth/login");
    console.log("   GET  /api/auth/profile");
    console.log("   GET  /api/habits");
    console.log("   GET  /api/dailies");
    console.log("   GET  /api/routines");
  }
});

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
