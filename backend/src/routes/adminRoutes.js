const express = require("express");
const router = express.Router();
const AdminAuthController = require("../controllers/adminAuthController");
const AdminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

console.log("📋 Admin routes module loaded");

// === AUTH ROUTES (No authentication required) ===
router.post("/auth/login", (req, res, next) => {
  console.log("🔵 Admin login route hit");
  AdminAuthController.login(req, res, next);
});
router.post("/auth/create-first-admin", AdminAuthController.createFirstAdmin);

// === PROTECTED ROUTES (Admin authentication required) ===

// Admin profile
router.get("/auth/profile", adminAuth, AdminAuthController.getProfile);

// Dashboard statistics
router.get("/dashboard/stats", adminAuth, AdminController.getDashboardStats);

// Themes management
router.get("/themes", adminAuth, AdminController.getThemes);
router.post("/themes", adminAuth, AdminController.createTheme);
router.put("/themes/:id", adminAuth, AdminController.updateTheme);
router.delete("/themes/:id", adminAuth, AdminController.deleteTheme);

// Events management
router.get("/events", adminAuth, AdminController.getEvents);
router.post("/events", adminAuth, AdminController.createEvent);
router.put("/events/:id", adminAuth, AdminController.updateEvent);
router.delete("/events/:id", adminAuth, AdminController.deleteEvent);

// User management
router.get("/users", adminAuth, AdminController.getUsers);
router.get("/users/:id", adminAuth, AdminController.getUserDetails);

module.exports = router;
