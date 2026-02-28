const { Settings, Blacklist, CMS, AuditLog } = require("../models/Settings");
const audit = require("../utils/audit");

// ── Get settings (creates default if none exist) ───────────────
exports.get = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

// ── Update settings ────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    Object.assign(settings, req.body);
    await settings.save();
    await audit("Config changed", req.user, req, `Settings updated`);
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

// ── Payment settings ───────────────────────────────────────────
exports.getPayment = async (req, res, next) => {
  try {
    const settings = await Settings.findOne().select("paymentMode txnFee razorpayKeyId enabledMethods");
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const { paymentMode, txnFee, razorpayKeyId, enabledMethods } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    if (paymentMode !== undefined)   settings.paymentMode    = paymentMode;
    if (txnFee !== undefined)        settings.txnFee         = txnFee;
    if (razorpayKeyId !== undefined) settings.razorpayKeyId  = razorpayKeyId;
    if (enabledMethods !== undefined)settings.enabledMethods = enabledMethods;
    await settings.save();
    await audit("Payment config updated", req.user, req, `Mode: ${settings.paymentMode}`);
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

// ── Audit logs ─────────────────────────────────────────────────
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, user } = req.query;
    const filter = {};
    if (action) filter.action = new RegExp(action, "i");
    if (user)   filter.user   = new RegExp(user,   "i");
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    const total = await AuditLog.countDocuments(filter);
    res.json({ success: true, total, logs });
  } catch (err) { next(err); }
};

// ── Blacklist ──────────────────────────────────────────────────
exports.getBlacklist = async (req, res, next) => {
  try {
    const list = await Blacklist.find().sort({ createdAt: -1 });
    res.json({ success: true, blacklist: list });
  } catch (err) { next(err); }
};

exports.addBlacklist = async (req, res, next) => {
  try {
    const { phone, reason } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required." });
    const entry = await Blacklist.create({ phone, reason, addedBy: req.user.email });
    await audit("Phone blacklisted", req.user, req, `${phone}: ${reason}`);
    res.status(201).json({ success: true, entry });
  } catch (err) { next(err); }
};

exports.removeBlacklist = async (req, res, next) => {
  try {
    const entry = await Blacklist.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found." });
    await audit("Blacklist removed", req.user, req, entry.phone);
    res.json({ success: true, message: "Removed from blacklist." });
  } catch (err) { next(err); }
};

// ── CMS ────────────────────────────────────────────────────────
exports.getCMS = async (req, res, next) => {
  try {
    const items = await CMS.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

exports.updateCMS = async (req, res, next) => {
  try {
    const { _id, ...data } = req.body;
    let item;
    if (_id) {
      item = await CMS.findByIdAndUpdate(_id, data, { new: true });
    } else {
      item = await CMS.create(data);
    }
    await audit("CMS updated", req.user, req, item.title);
    res.json({ success: true, item });
  } catch (err) { next(err); }
};

exports.deleteCMS = async (req, res, next) => {
  try {
    await CMS.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted." });
  } catch (err) { next(err); }
};
