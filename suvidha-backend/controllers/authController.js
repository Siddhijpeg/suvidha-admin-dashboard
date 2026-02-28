const User          = require("../models/User");
const generateToken = require("../utils/generateToken");
const audit         = require("../utils/audit");

// ── Register (Super Admin only) ────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered." });

    const user = await User.create({ name, email, password, role, department });
    await audit("User created", req.user, req, `Created user: ${email} (${role})`);
    res.status(201).json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

// ── Login ──────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    // Check account lock
    if (user.isLocked()) {
      const wait = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked. Try again in ${wait} minute(s).` });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockedUntil   = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
        user.loginAttempts = 0;
      }
      await user.save();
      await audit("Failed login", { email, role: "unknown" }, req, "Invalid password");
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!user.isActive) return res.status(403).json({ message: "Account deactivated. Contact Super Admin." });

    // Reset failed attempts
    user.loginAttempts = 0;
    user.lockedUntil   = undefined;
    user.lastLogin     = new Date();
    await user.save();

    await audit("Admin login", user, req, "Successful login");

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

// ── Get current user ───────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── Get all users (Super Admin) ────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").populate("department", "name");
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

// ── Update user ────────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, department, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, department, isActive },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    await audit("User updated", req.user, req, `Updated: ${user.email}`);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// ── Delete user ────────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    await audit("User deleted", req.user, req, `Deleted: ${user.email}`);
    res.json({ success: true, message: "User deleted." });
  } catch (err) { next(err); }
};
