const db = require("../config/database");
const bcrypt = require("bcrypt");

class Admin {
  // Create admin table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `;

    return db.run(query);
  }

  // Create an admin user
  static async create(username, email, password, role = "admin") {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO admins (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    const result = await db.run(query, [username, email, hashedPassword, role]);
    return { id: result.lastID, username, email, role };
  }

  // Find admin by email
  static async findByEmail(email) {
    const query = "SELECT * FROM admins WHERE email = ?";
    return db.get(query, [email]);
  }

  // Find admin by ID
  static async findById(id) {
    const query =
      "SELECT id, username, email, role, created_at, last_login FROM admins WHERE id = ?";
    return db.get(query, [id]);
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update last login
  static async updateLastLogin(id) {
    const query =
      "UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
    return db.run(query, [id]);
  }

  // Get all admins
  static async getAll() {
    const query =
      "SELECT id, username, email, role, created_at, last_login FROM admins";
    return db.all(query, []);
  }
}

module.exports = Admin;
