const Transaction = require("../models/Transaction");
const Complaint   = require("../models/Complaint");
const Kiosk       = require("../models/Kiosk");

const getDateRange = (range) => {
  const days  = range === "30d" ? 30 : range === "90d" ? 90 : 7;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

// ── Overview (dashboard metrics) ──────────────────────────────
exports.getOverview = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range);

    const [txnStats, kioskStats, complaintStats] = await Promise.all([
      Transaction.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
            _id:           null,
            totalRevenue:  { $sum: { $cond: [{ $eq: ["$status","success"] }, "$amount", 0] } },
            totalTxns:     { $sum: 1 },
            successTxns:   { $sum: { $cond: [{ $eq: ["$status","success"] }, 1, 0] } },
            failedTxns:    { $sum: { $cond: [{ $eq: ["$status","failed"]  }, 1, 0] } },
        }},
      ]),
      Kiosk.aggregate([
        { $group: {
            _id:         null,
            total:       { $sum: 1 },
            online:      { $sum: { $cond: [{ $eq: ["$status","online"]      }, 1, 0] } },
            offline:     { $sum: { $cond: [{ $eq: ["$status","offline"]     }, 1, 0] } },
            maintenance: { $sum: { $cond: [{ $eq: ["$status","maintenance"] }, 1, 0] } },
        }},
      ]),
      Complaint.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
            _id:      null,
            total:    { $sum: 1 },
            open:     { $sum: { $cond: [{ $eq: ["$status","open"]       }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $in: ["$status",["resolved","closed"]] }, 1, 0] } },
        }},
      ]),
    ]);

    const t = txnStats[0]    || { totalRevenue:0, totalTxns:0, successTxns:0, failedTxns:0 };
    const k = kioskStats[0]  || { total:0, online:0, offline:0, maintenance:0 };
    const c = complaintStats[0] || { total:0, open:0, resolved:0 };

    res.json({
      success: true,
      overview: {
        totalRevenue:    t.totalRevenue,
        totalTxns:       t.totalTxns,
        successTxns:     t.successTxns,
        failedTxns:      t.failedTxns,
        failureRate:     t.totalTxns > 0 ? ((t.failedTxns / t.totalTxns) * 100).toFixed(1) : 0,
        conversionRate:  t.totalTxns > 0 ? ((t.successTxns / t.totalTxns) * 100).toFixed(1) : 0,
        kiosks:          k,
        complaints:      c,
      },
    });
  } catch (err) { next(err); }
};

// ── Revenue chart ──────────────────────────────────────────────
exports.getRevenueChart = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range);
    const data = await Transaction.aggregate([
      { $match: { status: "success", createdAt: { $gte: since } } },
      { $group: {
          _id:     { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count:   { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Transaction chart ──────────────────────────────────────────
exports.getTxnChart = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range);
    const data = await Transaction.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
          _id:   { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
          success: { $sum: { $cond: [{ $eq: ["$status","success"] }, 1, 0] } },
          failed:  { $sum: { $cond: [{ $eq: ["$status","failed"]  }, 1, 0] } },
      }},
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Department stats ───────────────────────────────────────────
exports.getDeptStats = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range);
    const data = await Transaction.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
          _id:     "$deptName",
          txns:    { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$status","success"] }, "$amount", 0] } },
          success: { $sum: { $cond: [{ $eq: ["$status","success"] }, 1, 0] } },
      }},
      { $project: {
          name:        "$_id",
          txns:        1,
          revenue:     1,
          successRate: { $multiply: [{ $divide: ["$success", "$txns"] }, 100] },
      }},
      { $sort: { revenue: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Kiosk performance ──────────────────────────────────────────
exports.getKioskStats = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range);
    const data = await Transaction.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
          _id:     "$kioskId",
          sessions:{ $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$status","success"] }, "$amount", 0] } },
      }},
      { $sort: { sessions: -1 } },
      { $limit: 10 },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Behavioral metrics ─────────────────────────────────────────
exports.getBehavioral = async (req, res, next) => {
  try {
    const [total, success] = await Promise.all([
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: "success" }),
    ]);
    res.json({
      success: true,
      metrics: {
        conversionRate: total > 0 ? ((success / total) * 100).toFixed(1) : 0,
        failureRate:    total > 0 ? (((total - success) / total) * 100).toFixed(1) : 0,
      },
    });
  } catch (err) { next(err); }
};
