const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

class AdminAuthController {
  // Admin login
  static async login(req, res) {
    console.log("🔐 Admin login endpoint called");
    console.log("Request body:", req.body);

    try {
      const { email, password } = req.body;
      console.log("Email:", email, "Password:", password ? "***" : "missing");

      if (!email || !password) {
        console.log("❌ Missing email or password");
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      console.log("🔍 Finding admin by email...");
      const admin = await Admin.findByEmail(email);
      console.log("Admin found:", admin ? "Yes (ID: " + admin.id + ")" : "No");

      if (!admin) {
        console.log("❌ Admin not found");
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      console.log("🔑 Verifying password...");
      const isPasswordValid = await Admin.verifyPassword(
        password,
        admin.password,
      );
      console.log("Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("❌ Invalid password");
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      console.log("⏰ Updating last login...");
      // Update last login
      await Admin.updateLastLogin(admin.id);
      console.log("✅ Last login updated");

      console.log("🎫 Generating JWT token...");
      // Generate JWT token with admin flag
      const token = jwt.sign(
        { id: admin.id, email: admin.email, isAdmin: true },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" },
      );
      console.log("✅ Token generated");

      console.log("✅ Sending success response");
      res.json({
        success: true,
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
      console.log("✅ Response sent");
    } catch (error) {
      console.error("❌ Admin login error:", error);
      console.error("Stack:", error.stack);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Get admin profile
  static async getProfile(req, res) {
    try {
      res.json({
        success: true,
        admin: req.admin,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Create first admin (only if no admins exist)
  static async createFirstAdmin(req, res) {
    try {
      const admins = await Admin.getAll();

      if (admins.length > 0) {
        return res.status(403).json({
          success: false,
          message:
            "Admin already exists. Cannot create new admin without authentication.",
        });
      }

      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Username, email, and password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      const admin = await Admin.create(
        username,
        email,
        password,
        "super-admin",
      );

      res.status(201).json({
        success: true,
        message: "First admin created successfully",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error("Create first admin error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
}

module.exports = AdminAuthController;
