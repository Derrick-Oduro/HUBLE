const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const database = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const { createRateLimit, sanitizeInput } = require("./middleware/validation");

// Import routes
const authRoutes = require("./routes/authRoutes");
const habitsRoutes = require("./routes/habitsRoutes");
const dailiesRoutes = require("./routes/dailiesRoutes");
const routinesRoutes = require("./routes/routinesRoutes");
const focusRoutes = require("./routes/focusRoutes"); // Add this line
const statsRoutes = require("./routes/statsRoutes"); // Add this line

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting
app.use("/api/", createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
app.use("/api/auth/login", createRateLimit(15 * 60 * 1000, 5)); // 5 login attempts per 15 minutes
app.use("/api/auth/register", createRateLimit(60 * 60 * 1000, 3)); // 3 registrations per hour

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-production-domain.com"]
        : [
            "http://localhost:3000",
            "http://localhost:8081",
            "exp://192.168.1.100:8081",
          ], // Add your Expo dev URLs
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Input sanitization
app.use(sanitizeInput);

// Request logging (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Initialize database connection
database
  .connect()
  .then(() => console.log("✅ Database connected successfully"))
  .catch(console.error);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "HUBLE API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitsRoutes);
app.use("/api/dailies", dailiesRoutes);
app.use("/api/routines", routinesRoutes);
app.use("/api/focus", focusRoutes); // Add this line
app.use("/api/stats", statsRoutes); // Add this line

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    availableRoutes: [
      "GET /health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/profile",
      "GET /api/habits",
      "GET /api/dailies",
      "GET /api/routines",
    ],
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  try {
    await database.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  try {
    await database.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

module.exports = app;
