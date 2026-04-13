const Theme = require("../models/Theme");
const Event = require("../models/Event");
const User = require("../models/User");
const UserStats = require("../models/UserStats");
const database = require("../config/database");

class AdminController {
  // === THEMES MANAGEMENT ===

  // Get all themes
  static async getThemes(req, res) {
    try {
      const themes = await Theme.getAll();
      res.json({
        success: true,
        themes,
      });
    } catch (error) {
      console.error("Get themes error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch themes",
        error: error.message,
      });
    }
  }

  // Create theme
  static async createTheme(req, res) {
    try {
      const theme = await Theme.create(req.body);
      res.status(201).json({
        success: true,
        message: "Theme created successfully",
        theme,
      });
    } catch (error) {
      console.error("Create theme error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create theme",
        error: error.message,
      });
    }
  }

  // Update theme
  static async updateTheme(req, res) {
    try {
      const { id } = req.params;
      const theme = await Theme.update(id, req.body);
      res.json({
        success: true,
        message: "Theme updated successfully",
        theme,
      });
    } catch (error) {
      console.error("Update theme error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update theme",
        error: error.message,
      });
    }
  }

  // Delete theme
  static async deleteTheme(req, res) {
    try {
      const { id } = req.params;
      await Theme.delete(id);
      res.json({
        success: true,
        message: "Theme deleted successfully",
      });
    } catch (error) {
      console.error("Delete theme error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete theme",
        error: error.message,
      });
    }
  }

  // === EVENTS MANAGEMENT ===

  // Get all events
  static async getEvents(req, res) {
    try {
      const events = await Event.getAll();
      res.json({
        success: true,
        events,
      });
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch events",
        error: error.message,
      });
    }
  }

  // Create event
  static async createEvent(req, res) {
    try {
      const event = await Event.create(req.body, req.adminId);
      res.status(201).json({
        success: true,
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create event",
        error: error.message,
      });
    }
  }

  // Update event
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.update(id, req.body);
      res.json({
        success: true,
        message: "Event updated successfully",
        event,
      });
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update event",
        error: error.message,
      });
    }
  }

  // Delete event
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      await Event.delete(id);
      res.json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete event",
        error: error.message,
      });
    }
  }

  // === USER MANAGEMENT ===

  // Get all users with stats
  static async getUsers(req, res) {
    try {
      // Get all users
      const users = await database.all(
        `SELECT id, username, email, avatar, avatar_color, avatar_border, created_at FROM users ORDER BY created_at DESC`,
      );

      // Get stats for each user
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const stats = await UserStats.findByUserId(user.id);
          return { ...user, stats };
        }),
      );

      res.json({
        success: true,
        users: usersWithStats,
        total: users.length,
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  }

  // Get user details
  static async getUserDetails(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const stats = await UserStats.findByUserId(id);

      res.json({
        success: true,
        user: {
          ...user,
          stats,
        },
      });
    } catch (error) {
      console.error("Get user details error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user details",
        error: error.message,
      });
    }
  }

  // === DASHBOARD STATISTICS ===

  static async getDashboardStats(req, res) {
    try {
      // Get total users
      const usersRow = await database.get(
        "SELECT COUNT(*) as count FROM users",
      );
      const totalUsers = usersRow?.count || 0;

      // Get active events
      const activeEvents = await Event.getActive();

      // Get total themes
      const themesRow = await database.get(
        "SELECT COUNT(*) as count FROM themes WHERE is_active = 1",
      );
      const totalThemes = themesRow?.count || 0;

      // Get recent signups (last 7 days)
      const signupsRow = await database.get(
        `SELECT COUNT(*) as count FROM users 
           WHERE created_at >= datetime('now', '-7 days')`,
      );
      const recentSignups = signupsRow?.count || 0;

      res.json({
        success: true,
        stats: {
          totalUsers,
          activeEvents: activeEvents.length,
          totalThemes,
          recentSignups,
        },
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard stats",
        error: error.message,
      });
    }
  }
}

module.exports = AdminController;
