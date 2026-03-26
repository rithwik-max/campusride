const mongoose = require("mongoose");
const Joi = require("joi");

const requestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
});

const announcementSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true, trim: true },
    travelDate: { type: Date, required: true },
    travelTime: { type: String, required: true },
    mode: { type: String, enum: ["auto", "bus", "shared-cab"], required: true },
    seatsAvailable: { type: Number, required: true, min: 1, max: 10 },
    note: { type: String, trim: true, maxlength: 200 },
    requests: [requestSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const validateAnnouncement = (data) => {
  const schema = Joi.object({
    destination: Joi.string().min(2).required(),
    travelDate: Joi.date().min("now").required(),
    travelTime: Joi.string().required(),
    mode: Joi.string().valid("auto", "bus", "shared-cab").required(),
    seatsAvailable: Joi.number().integer().min(1).max(10).required(),
    note: Joi.string().max(200).allow("", null),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = mongoose.model("Announcement", announcementSchema);
module.exports.validateAnnouncement = validateAnnouncement;
