const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

// Roll number validation: av.sc.u4cse24101 to av.sc.u4cse24151
const ROLL_REGEX = /^av\.sc\.u4cse24(1[0-4]\d|150|151)$/i;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (v) => ROLL_REGEX.test(v),
        message: "Invalid roll number. Must be between av.sc.u4cse24101 and av.sc.u4cse24151.",
      },
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Joi schema for registration validation
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({ "string.pattern.base": "Enter a valid 10-digit Indian phone number." }),
    rollNumber: Joi.string()
      .pattern(/^av\.sc\.u4cse24(1[0-4]\d|150|151)$/i)
      .required()
      .messages({
        "string.pattern.base":
          "Roll number must be between av.sc.u4cse24101 and av.sc.u4cse24151.",
      }),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = mongoose.model("User", userSchema);
module.exports.validateUser = validateUser;
