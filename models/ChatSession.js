const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    announcement: { type: mongoose.Schema.Types.ObjectId, ref: "Announcement", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
