const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 500 },
    room:    { type: String, default: "general" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);