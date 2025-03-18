const express = require("express");
const db = require("../db");

const router = express.Router();

// Get all daily tasks
router.get("/", (req, res) => {
  const { user_id } = req.query;
  db.query(
    "SELECT * FROM dailies WHERE user_id = ?",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

module.exports = router;
