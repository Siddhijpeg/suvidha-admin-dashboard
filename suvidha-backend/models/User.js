const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:      { type: String, required: true, minlength: 6, select: false },
  role:          { type: String, enum: ["super_admin", "department_admin", "operator"], default: "operator" },
  department:    { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
  isActive:      { type: Boolean, default: true },
  twoFactorSecret:   { type: String, select: false },
  twoFactorEnabled:  { type: Boolean, default: false },
  lastLogin:     { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockedUntil:   { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > Date.now();
};

module.exports = mongoose.model("User", userSchema);
