require("dotenv").config();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const environment = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: toInt(process.env.PORT, 3000),
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  isProduction: (process.env.NODE_ENV || "development") === "production",
});

module.exports = environment;
