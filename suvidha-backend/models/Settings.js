const mongoose = require("mongoose");

// ── System Settings ────────────────────────────────────────────
const settingsSchema = new mongoose.Schema({
  sessionTimeout:  { type: Number, default: 5 },
  defaultLanguage: { type: String, default: "hi" },
  audioGuidance:   { type: Boolean, default: true },
  loggingLevel:    { type: String, enum: ["error","warn","info","debug"], default: "info" },
  uiTheme:         { type: String, default: "light" },
  printerModel:    { type: String, default: "Epson TM-T88VI" },
  printerBaudRate: { type: Number, default: 9600 },
  // Payment
  paymentMode:       { type: String, enum: ["test","live"], default: "test" },
  txnFee:            { type: Number, default: 2.5 },
  razorpayKeyId:     { type: String, default: "" },
  enabledMethods:    { type: [String], default: ["upi","card","netbanking"] },
}, { timestamps: true });

// ── Blacklist ──────────────────────────────────────────────────
const blacklistSchema = new mongoose.Schema({
  phone:    { type: String, required: true, unique: true },
  reason:   { type: String, default: "Manual blacklist" },
  addedBy:  { type: String },
}, { timestamps: true });

// ── CMS Announcements ──────────────────────────────────────────
const cmsSchema = new mongoose.Schema({
  type:    { type: String, enum: ["announcement","holiday","outage","alert"], default: "announcement" },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  active:  { type: Boolean, default: true },
}, { timestamps: true });

// ── Audit Log ──────────────────────────────────────────────────
const auditSchema = new mongoose.Schema({
  action:  { type: String, required: true },
  user:    { type: String, required: true },
  ip:      { type: String, default: "" },
  detail:  { type: String, default: "" },
  role:    { type: String, default: "" },
}, { timestamps: true });

module.exports = {
  Settings:  mongoose.model("Settings",  settingsSchema),
  Blacklist: mongoose.model("Blacklist", blacklistSchema),
  CMS:       mongoose.model("CMS",       cmsSchema),
  AuditLog:  mongoose.model("AuditLog",  auditSchema),
};
