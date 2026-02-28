const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  txnId:      { type: String, required: true, unique: true },
  paymentId:  { type: String, default: "" },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  deptName:   { type: String, required: true },
  service:    { type: String, required: true },
  account:    { type: String, required: true },
  amount:     { type: Number, default: 0, min: 0 },
  method:     { type: String, enum: ["UPI", "Card", "Net Banking", "Wallet", "—"], default: "—" },
  status:     { type: String, enum: ["success", "failed", "pending"], default: "pending" },
  kiosk:      { type: mongoose.Schema.Types.ObjectId, ref: "Kiosk" },
  kioskId:    { type: String },
  location:   { type: String },
  failReason: { type: String },
}, { timestamps: true });

// Auto-generate txnId
transactionSchema.pre("save", async function (next) {
  if (!this.txnId) {
    const count = await mongoose.model("Transaction").countDocuments();
    this.txnId = `TXN-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
