const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require("./db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const habitsRoutes = require("./routes/habitsRoutes");
const dailiesRoutes = require("./routes/dailiesRoutes");
const routinesRoutes = require("./routes/routinesRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitsRoutes);
app.use("/api/dailies", dailiesRoutes);
app.use("/api/routines", routinesRoutes);

app.listen(5000, () =>
  console.log("🚀 Backend running on http://localhost:5000")
);
