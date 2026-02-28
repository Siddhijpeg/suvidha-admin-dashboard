const Transaction = require("../models/Transaction");

// ── Get all transactions (with filters + pagination) ───────────
exports.getAll = async (req, res, next) => {
  try {
    const { status, dept, kiosk, search, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status   = status;
    if (dept)   filter.deptName = new RegExp(dept, "i");
    if (kiosk)  filter.kioskId  = kiosk;
    if (search) filter.$or = [
      { txnId:   new RegExp(search, "i") },
      { account: new RegExp(search, "i") },
      { deptName:new RegExp(search, "i") },
      { service: new RegExp(search, "i") },
    ];
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo)   filter.createdAt.$lte = new Date(dateTo + "T23:59:59");
    }

    const total        = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("department", "name")
      .populate("kiosk", "kioskId location");

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), transactions });
  } catch (err) { next(err); }
};

// ── Get single transaction ─────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const txn = await Transaction.findById(req.params.id).populate("department kiosk");
    if (!txn) return res.status(404).json({ message: "Transaction not found." });
    res.json({ success: true, transaction: txn });
  } catch (err) { next(err); }
};

// ── Revenue summary ────────────────────────────────────────────
exports.getRevenue = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const days  = range === "30d" ? 30 : range === "90d" ? 90 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await Transaction.aggregate([
      { $match: { status: "success", createdAt: { $gte: since } } },
      { $group: {
          _id:     { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count:   { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = result.reduce((s, r) => s + r.revenue, 0);
    const totalTxns    = result.reduce((s, r) => s + r.count, 0);
    res.json({ success: true, totalRevenue, totalTxns, data: result });
  } catch (err) { next(err); }
};

// ── Daily reconciliation ───────────────────────────────────────
exports.reconcile = async (req, res, next) => {
  try {
    const date  = req.query.date || new Date().toISOString().split("T")[0];
    const start = new Date(date);
    const end   = new Date(date + "T23:59:59");

    const summary = await Transaction.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: {
          _id:     "$status",
          total:   { $sum: "$amount" },
          count:   { $sum: 1 },
      }},
    ]);
    res.json({ success: true, date, summary });
  } catch (err) { next(err); }
};

// ── Export (returns full list for CSV) ────────────────────────
exports.exportCSV = async (req, res, next) => {
  try {
    const filter = {};
    const { dateFrom, dateTo, status, dept } = req.query;
    if (status)              filter.status   = status;
    if (dept)                filter.deptName = new RegExp(dept,"i");
    if (dateFrom || dateTo)  filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo)   filter.createdAt.$lte = new Date(dateTo+"T23:59:59");

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).limit(5000);
    res.json({ success: true, transactions });
  } catch (err) { next(err); }
};
