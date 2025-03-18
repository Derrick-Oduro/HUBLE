const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "User registered!" });
    }
  );
});

// User Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(400).json({ error: "User not found" });

      const isValid = await bcrypt.compare(password, results[0].password);
      if (!isValid) return res.status(400).json({ error: "Invalid password" });

      const token = jwt.sign({ userId: results[0].id }, "your_secret_key", {
        expiresIn: "7d",
      });
      res.json({ token, user: results[0] });
    }
  );
});

module.exports = router;
