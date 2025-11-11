require("dotenv").config();
const app = require("./src/app");
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

// Listen on all network interfaces (0.0.0.0) instead of just localhost
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 HUBLE Backend Server Started!`);
  console.log(`📍 Local access: http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://${networkIP}:${PORT}`);
  console.log(`🏥 Health check: http://${networkIP}:${PORT}/health`);
  console.log(`📱 Use this IP in your frontend: ${networkIP}`);
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
