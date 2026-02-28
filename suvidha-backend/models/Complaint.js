const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  department:  { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  deptName:    { type: String, required: true },
  category:    { type: String, required: true },
  account:     { type: String, required: true },
  description: { type: String, default: "" },
  status:      { type: String, enum: ["open", "in_progress", "escalated", "resolved", "closed"], default: "open" },
  priority:    { type: String, enum: ["low", "medium", "high"], default: "medium" },
  assignedTo:  { type: String, default: "" },
  kiosk:       { type: mongoose.Schema.Types.ObjectId, ref: "Kiosk" },
  kioskId:     { type: String },
  resolution:  { type: String, default: "" },
  resolvedAt:  { type: Date },
  escalatedAt: { type: Date },
  history: [{
    status:    String,
    changedBy: String,
    note:      String,
    changedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

complaintSchema.pre("save", async function (next) {
  if (!this.complaintId) {
    const count = await mongoose.model("Complaint").countDocuments();
    this.complaintId = `CMP-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Complaint", complaintSchema);
