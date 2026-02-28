const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  fee:     { type: Number, default: 0, min: 0 },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
  name:         { type: String, required: true, unique: true, trim: true },
  icon:         { type: String, default: "🏢" },
  color:        { type: String, default: "#3b82f6" },
  description:  { type: String, default: "" },
  serviceHours: { type: String, default: "9 AM – 5 PM" },
  enabled:      { type: Boolean, default: true },
  services:     [serviceSchema],
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);
