const express = require("express");
const router = express.Router();
const dataExportController = require("../controllers/dataExportController");
const authenticateToken = require("../middleware/auth");

// Export all user data
router.get("/export", authenticateToken, dataExportController.exportUserData);

// Get analytics
router.get("/analytics", authenticateToken, dataExportController.getAnalytics);

// Create backup
router.post("/backup", authenticateToken, dataExportController.backupData);

module.exports = router;
