const express = require("express");
const router  = express.Router();
const Chat    = require("../models/Chat");
const { protect } = require("../middleware/auth");

// GET /api/chat?room=general&limit=50
router.get("/", protect, async (req, res) => {
  try {
    const { room = "general", limit = 50 } = req.query;
    const messages = await Chat.find({ room })
      .sort({ createdAt: -1 })
      .limit(+limit)
      .populate("user", "name");
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat
router.post("/", protect, async (req, res) => {
  try {
    const { message, room = "general" } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: "Empty message" });
    const chat = await Chat.create({ user: req.user._id, message: message.trim(), room });
    await chat.populate("user", "name");
    res.status(201).json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;