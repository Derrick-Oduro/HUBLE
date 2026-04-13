const db = require("../config/database");

class Event {
  // Create events table
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        rewards TEXT,
        requirements TEXT,
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise((resolve, reject) => {
      db.run(query, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Create event
  static async create(eventData, adminId) {
    const {
      title,
      description,
      type,
      start_date,
      end_date,
      rewards,
      requirements,
      max_participants,
    } = eventData;

    const query = `
      INSERT INTO events (
        title, description, type, start_date, end_date,
        rewards, requirements, max_participants, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      db.run(
        query,
        [
          title,
          description,
          type,
          start_date,
          end_date,
          rewards ? JSON.stringify(rewards) : null,
          requirements ? JSON.stringify(requirements) : null,
          max_participants,
          adminId,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...eventData });
        },
      );
    });
  }

  // Get all events
  static async getAll() {
    const query = `
      SELECT e.*, a.username as created_by_name
      FROM events e
      LEFT JOIN admins a ON e.created_by = a.id
      WHERE e.is_active = 1
      ORDER BY e.start_date DESC
    `;

    return new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else {
          const events = rows.map((row) => ({
            ...row,
            rewards: row.rewards ? JSON.parse(row.rewards) : null,
            requirements: row.requirements
              ? JSON.parse(row.requirements)
              : null,
            is_active: Boolean(row.is_active),
          }));
          resolve(events);
        }
      });
    });
  }

  // Get active events
  static async getActive() {
    const query = `
      SELECT * FROM events
      WHERE is_active = 1
        AND start_date <= datetime('now')
        AND end_date >= datetime('now')
      ORDER BY end_date ASC
    `;

    return new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else {
          const events = rows.map((row) => ({
            ...row,
            rewards: row.rewards ? JSON.parse(row.rewards) : null,
            requirements: row.requirements
              ? JSON.parse(row.requirements)
              : null,
            is_active: Boolean(row.is_active),
          }));
          resolve(events);
        }
      });
    });
  }

  // Update event
  static async update(id, eventData) {
    const {
      title,
      description,
      type,
      start_date,
      end_date,
      rewards,
      requirements,
      max_participants,
      is_active,
    } = eventData;

    const query = `
      UPDATE events
      SET title = ?, description = ?, type = ?, start_date = ?,
          end_date = ?, rewards = ?, requirements = ?,
          max_participants = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
      db.run(
        query,
        [
          title,
          description,
          type,
          start_date,
          end_date,
          rewards ? JSON.stringify(rewards) : null,
          requirements ? JSON.stringify(requirements) : null,
          max_participants,
          is_active ? 1 : 0,
          id,
        ],
        (err) => {
          if (err) reject(err);
          else resolve({ id, ...eventData });
        },
      );
    });
  }

  // Delete event
  static async delete(id) {
    const query =
      "UPDATE events SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

    return new Promise((resolve, reject) => {
      db.run(query, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Event;
