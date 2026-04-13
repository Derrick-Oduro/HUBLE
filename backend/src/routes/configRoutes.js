const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

router.get("/themes", configController.getThemes);
router.get("/avatars", configController.getAvatars);

module.exports = router;
