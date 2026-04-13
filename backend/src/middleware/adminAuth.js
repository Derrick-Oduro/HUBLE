const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key",
      );

      // Check if this is an admin token (has isAdmin flag)
      if (!decoded.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      const admin = await Admin.findById(decoded.id);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin not found",
        });
      }

      req.admin = admin;
      req.adminId = admin.id;
      next();
    } catch (_error) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = adminAuth;
