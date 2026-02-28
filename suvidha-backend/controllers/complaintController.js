const Complaint = require("../models/Complaint");
const audit     = require("../utils/audit");

// ── Get all complaints ─────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { status, dept, priority, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (dept)     filter.deptName = new RegExp(dept, "i");
    if (priority) filter.priority = priority;
    if (search)   filter.$or = [
      { complaintId: new RegExp(search, "i") },
      { category:    new RegExp(search, "i") },
      { account:     new RegExp(search, "i") },
    ];

    const total      = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, complaints });
  } catch (err) { next(err); }
};

// ── Get single complaint ───────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    res.json({ success: true, complaint });
  } catch (err) { next(err); }
};

// ── Update status + remarks ────────────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    const prevStatus = complaint.status;
    complaint.status     = status;
    complaint.resolution = remarks || complaint.resolution;
    if (status === "resolved" || status === "closed") complaint.resolvedAt = new Date();

    // Push to history
    complaint.history.push({ status, changedBy: req.user.email, note: remarks || "" });
    await complaint.save();
    await audit("Complaint status updated", req.user, req, `${complaint.complaintId}: ${prevStatus} → ${status}`);
    res.json({ success: true, complaint });
  } catch (err) { next(err); }
};

// ── Assign to operator ─────────────────────────────────────────
exports.assign = async (req, res, next) => {
  try {
    const { operatorId } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: operatorId, status: "in_progress" },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    await audit("Complaint assigned", req.user, req, `${complaint.complaintId} assigned to ${operatorId}`);
    res.json({ success: true, complaint });
  } catch (err) { next(err); }
};

// ── Escalate ───────────────────────────────────────────────────
exports.escalate = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "escalated", escalatedAt: new Date() },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    await audit("Complaint escalated", req.user, req, `${complaint.complaintId} escalated`);
    res.json({ success: true, complaint });
  } catch (err) { next(err); }
};

// ── Stats ──────────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, stats });
  } catch (err) { next(err); }
};
