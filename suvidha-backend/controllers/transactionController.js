const supabase = require("../config/supabase");
const { mapRecord, mapRecords } = require("../utils/records");

const toError = (error, statusCode = 500) => ({ statusCode, message: error.message || "Request failed" });

const getTimestamp = (row) => row.createdAt || row.created_at;

const groupByDate = (rows, amountField = "amount") => {
  const map = new Map();
  rows.forEach((row) => {
    const date = new Date(getTimestamp(row));
    if (Number.isNaN(date.getTime())) return;
    const key = date.toISOString().slice(0, 10);
    const current = map.get(key) || { _id: key, revenue: 0, count: 0, total: 0, success: 0, failed: 0 };
    current.revenue += Number(row[amountField] || 0);
    current.count += 1;
    map.set(key, current);
  });
  return Array.from(map.values()).sort((a, b) => (a._id > b._id ? 1 : -1));
};

// ── Get all transactions (with filters + pagination) ───────────
exports.getAll = async (req, res, next) => {
  try {
    const { status, dept, kiosk, search, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    let query = supabase.from("transactions").select("*", { count: "exact" });
    if (status) query = query.eq("status", status);
    if (dept) query = query.ilike("deptName", `%${dept}%`);
    if (kiosk) query = query.eq("kioskId", kiosk);
    if (search) {
      query = query.or(`txnId.ilike.%${search}%,account.ilike.%${search}%,deptName.ilike.%${search}%,service.ilike.%${search}%`);
    }
    if (dateFrom) query = query.gte("created_at", new Date(dateFrom).toISOString());
    if (dateTo) query = query.lte("created_at", new Date(`${dateTo}T23:59:59`).toISOString());

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) return next(toError(error, 500));

    res.json({
      success: true,
      total: count || 0,
      page: Number(page),
      pages: Math.ceil((count || 0) / Number(limit || 1)),
      transactions: mapRecords(data),
    });
  } catch (err) { next(err); }
};

// ── Get single transaction ─────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Transaction not found." });
    if (error) return next(toError(error, 500));

    res.json({ success: true, transaction: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Revenue summary ────────────────────────────────────────────
exports.getRevenue = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .select("amount,status,created_at,createdAt")
      .eq("status", "success")
      .gte("created_at", since);

    if (error) return next(toError(error, 500));

    const grouped = groupByDate(data, "amount").map((row) => ({
      _id: row._id,
      revenue: row.revenue,
      count: row.count,
    }));

    const totalRevenue = grouped.reduce((s, r) => s + r.revenue, 0);
    const totalTxns = grouped.reduce((s, r) => s + r.count, 0);
    res.json({ success: true, totalRevenue, totalTxns, data: grouped });
  } catch (err) { next(err); }
};

// ── Daily reconciliation ───────────────────────────────────────
exports.reconcile = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const start = new Date(date).toISOString();
    const end = new Date(`${date}T23:59:59`).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .select("status,amount,created_at,createdAt")
      .gte("created_at", start)
      .lte("created_at", end);

    if (error) return next(toError(error, 500));

    const summary = data.reduce((acc, row) => {
      const key = row.status || "unknown";
      const current = acc[key] || { _id: key, total: 0, count: 0 };
      current.total += Number(row.amount || 0);
      current.count += 1;
      acc[key] = current;
      return acc;
    }, {});

    res.json({ success: true, date, summary: Object.values(summary) });
  } catch (err) { next(err); }
};

// ── Export (returns full list for CSV) ────────────────────────
exports.exportCSV = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, status, dept } = req.query;

    let query = supabase.from("transactions").select("*");
    if (status) query = query.eq("status", status);
    if (dept) query = query.ilike("deptName", `%${dept}%`);
    if (dateFrom) query = query.gte("created_at", new Date(dateFrom).toISOString());
    if (dateTo) query = query.lte("created_at", new Date(`${dateTo}T23:59:59`).toISOString());

    const { data, error } = await query.order("created_at", { ascending: false }).limit(5000);
    if (error) return next(toError(error, 500));

    res.json({ success: true, transactions: mapRecords(data) });
  } catch (err) { next(err); }
};
