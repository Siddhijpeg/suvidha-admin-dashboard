const supabase = require("../config/supabase");

const toError = (error, statusCode = 500) => ({ statusCode, message: error.message || "Request failed" });

const getDateRange = (range) => {
  const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

const getTimestamp = (row) => row.createdAt || row.created_at;

const groupByDate = (rows, init, update) => {
  const map = new Map();
  rows.forEach((row) => {
    const date = new Date(getTimestamp(row));
    if (Number.isNaN(date.getTime())) return;
    const key = date.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, init(key));
    update(map.get(key), row);
  });
  return Array.from(map.values()).sort((a, b) => (a._id > b._id ? 1 : -1));
};

// ── Overview (dashboard metrics) ──────────────────────────────
exports.getOverview = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range).toISOString();

    const [txnRes, kioskRes, complaintRes] = await Promise.all([
      supabase.from("transactions").select("amount,status,created_at,createdAt").gte("created_at", since),
      supabase.from("kiosks").select("status"),
      supabase.from("complaints").select("status,created_at,createdAt").gte("created_at", since),
    ]);

    if (txnRes.error) return next(toError(txnRes.error, 500));
    if (kioskRes.error) return next(toError(kioskRes.error, 500));
    if (complaintRes.error) return next(toError(complaintRes.error, 500));

    const txnStats = txnRes.data.reduce(
      (acc, row) => {
        acc.totalTxns += 1;
        if (row.status === "success") {
          acc.successTxns += 1;
          acc.totalRevenue += Number(row.amount || 0);
        } else if (row.status === "failed") {
          acc.failedTxns += 1;
        }
        return acc;
      },
      { totalRevenue: 0, totalTxns: 0, successTxns: 0, failedTxns: 0 }
    );

    const kioskStats = kioskRes.data.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === "online") acc.online += 1;
        if (row.status === "offline") acc.offline += 1;
        if (row.status === "maintenance") acc.maintenance += 1;
        return acc;
      },
      { total: 0, online: 0, offline: 0, maintenance: 0 }
    );

    const complaintStats = complaintRes.data.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === "open") acc.open += 1;
        if (row.status === "resolved" || row.status === "closed") acc.resolved += 1;
        return acc;
      },
      { total: 0, open: 0, resolved: 0 }
    );

    res.json({
      success: true,
      overview: {
        totalRevenue:    txnStats.totalRevenue,
        totalTxns:       txnStats.totalTxns,
        successTxns:     txnStats.successTxns,
        failedTxns:      txnStats.failedTxns,
        failureRate:     txnStats.totalTxns > 0 ? ((txnStats.failedTxns / txnStats.totalTxns) * 100).toFixed(1) : 0,
        conversionRate:  txnStats.totalTxns > 0 ? ((txnStats.successTxns / txnStats.totalTxns) * 100).toFixed(1) : 0,
        kiosks:          kioskStats,
        complaints:      complaintStats,
      },
    });
  } catch (err) { next(err); }
};

// ── Revenue chart ──────────────────────────────────────────────
exports.getRevenueChart = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .select("amount,status,created_at,createdAt")
      .eq("status", "success")
      .gte("created_at", since);
    if (error) return next(toError(error, 500));

    const grouped = groupByDate(
      data,
      (key) => ({ _id: key, revenue: 0, count: 0 }),
      (acc, row) => {
        acc.revenue += Number(row.amount || 0);
        acc.count += 1;
      }
    );

    res.json({ success: true, data: grouped });
  } catch (err) { next(err); }
};

// ── Transaction chart ──────────────────────────────────────────
exports.getTxnChart = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .select("status,created_at,createdAt")
      .gte("created_at", since);
    if (error) return next(toError(error, 500));

    const grouped = groupByDate(
      data,
      (key) => ({ _id: key, total: 0, success: 0, failed: 0 }),
      (acc, row) => {
        acc.total += 1;
        if (row.status === "success") acc.success += 1;
        if (row.status === "failed") acc.failed += 1;
      }
    );

    res.json({ success: true, data: grouped });
  } catch (err) { next(err); }
};

// ── Department stats ───────────────────────────────────────────
exports.getDeptStats = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .select("deptName,amount,status,created_at,createdAt")
      .gte("created_at", since);
    if (error) return next(toError(error, 500));

    const grouped = data.reduce((acc, row) => {
      const key = row.deptName || "Unknown";
      const current = acc[key] || { name: key, txns: 0, revenue: 0, success: 0 };
      current.txns += 1;
      if (row.status === "success") {
        current.success += 1;
        current.revenue += Number(row.amount || 0);
      }
      acc[key] = current;
      return acc;
    }, {});

    const result = Object.values(grouped).map((row) => ({
      ...row,
      successRate: row.txns > 0 ? (row.success / row.txns) * 100 : 0,
    }));

    result.sort((a, b) => b.revenue - a.revenue);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ── Kiosk performance ──────────────────────────────────────────
exports.getKioskStats = async (req, res, next) => {
  try {
    const { range = "7d" } = req.query;
    const since = getDateRange(range).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .select("kioskId,amount,status,created_at,createdAt")
      .gte("created_at", since);
    if (error) return next(toError(error, 500));

    const grouped = data.reduce((acc, row) => {
      const key = row.kioskId || "Unknown";
      const current = acc[key] || { _id: key, sessions: 0, revenue: 0 };
      current.sessions += 1;
      if (row.status === "success") current.revenue += Number(row.amount || 0);
      acc[key] = current;
      return acc;
    }, {});

    const result = Object.values(grouped).sort((a, b) => b.sessions - a.sessions).slice(0, 10);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ── Behavioral metrics ─────────────────────────────────────────
exports.getBehavioral = async (req, res, next) => {
  try {
    const [totalRes, successRes] = await Promise.all([
      supabase.from("transactions").select("*", { count: "exact", head: true }),
      supabase.from("transactions").select("*", { count: "exact", head: true }).eq("status", "success"),
    ]);

    if (totalRes.error) return next(toError(totalRes.error, 500));
    if (successRes.error) return next(toError(successRes.error, 500));

    const total = totalRes.count || 0;
    const success = successRes.count || 0;

    res.json({
      success: true,
      metrics: {
        conversionRate: total > 0 ? ((success / total) * 100).toFixed(1) : 0,
        failureRate:    total > 0 ? (((total - success) / total) * 100).toFixed(1) : 0,
      },
    });
  } catch (err) { next(err); }
};
