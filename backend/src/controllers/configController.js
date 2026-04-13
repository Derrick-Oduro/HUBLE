const Theme = require("../models/Theme");
const AvatarOption = require("../models/AvatarOption");

exports.getThemes = async (req, res) => {
  try {
    const themes = await Theme.getAll();
    res.json({ success: true, themes });
  } catch (error) {
    console.error("Get config themes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch themes",
      error: error.message,
    });
  }
};

exports.getAvatars = async (req, res) => {
  try {
    const avatars = await AvatarOption.getAll();
    res.json({ success: true, avatars });
  } catch (error) {
    console.error("Get config avatars error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch avatars",
      error: error.message,
    });
  }
};
