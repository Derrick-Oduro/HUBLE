const authRoutes = require("./authRoutes");
const habitsRoutes = require("./habitsRoutes");
const dailiesRoutes = require("./dailiesRoutes");
const routinesRoutes = require("./routinesRoutes");
const focusRoutes = require("./focusRoutes");
const statsRoutes = require("./statsRoutes");
const socialRoutes = require("./socialRoutes");
const adminRoutes = require("./adminRoutes");
const achievementsRoutes = require("./achievementsRoutes");
const dataRoutes = require("./dataRoutes");
const configRoutes = require("./configRoutes");

const registerRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/habits", habitsRoutes);
  app.use("/api/dailies", dailiesRoutes);
  app.use("/api/routines", routinesRoutes);
  app.use("/api/focus", focusRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/social", socialRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/achievements", achievementsRoutes);
  app.use("/api/data", dataRoutes);
  app.use("/api/config", configRoutes);
};

module.exports = registerRoutes;
