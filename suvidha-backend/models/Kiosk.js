const mongoose = require("mongoose");

const kioskSchema = new mongoose.Schema({
  kioskId:         { type: String, required: true, unique: true, uppercase: true, trim: true },
  location:        { type: String, required: true, trim: true },
  city:            { type: String, required: true, trim: true },
  state:           { type: String, required: true, trim: true },
  ip:              { type: String, trim: true },
  status:          { type: String, enum: ["online", "offline", "maintenance"], default: "offline" },
  uptime:          { type: Number, default: 0, min: 0, max: 100 },
  currentSession:  { type: String, default: "None" },
  printerStatus:   { type: String, enum: ["ok", "error", "unknown"], default: "unknown" },
  networkStatus:   { type: String, enum: ["ok", "down", "unknown"], default: "unknown" },
  softwareVersion: { type: String, default: "v1.0.0" },
  lastOnline:      { type: Date },
  totalSessions:   { type: Number, default: 0 },
  todaySessions:   { type: Number, default: 0 },
  notes:           { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Kiosk", kioskSchema);
