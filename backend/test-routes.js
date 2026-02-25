const express = require("express");
const router = express.Router();

console.log("Loading controller...");
const socialController = require("./src/controllers/socialController");
console.log("Controller loaded");
console.log("getFriends type:", typeof socialController.getFriends);
console.log("authenticate module...");
const { authenticate } = require("./src/middleware/auth");
console.log("authenticate loaded, type:", typeof authenticate);

console.log("Setting up route...");
router.get("/friends", authenticate, socialController.getFriends);
console.log("Route setup successful!");

module.exports = router;
