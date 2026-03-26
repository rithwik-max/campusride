const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: String,
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
