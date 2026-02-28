const supabase = require("../config/supabase");
const audit = require("../utils/audit");
const { mapRecord, mapRecords } = require("../utils/records");

const toError = (error, statusCode = 500) => ({ statusCode, message: error.message || "Request failed" });

const formatAuditTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)}`;
};

const mapAuditLog = (log) => ({
  ...mapRecord(log),
  time: formatAuditTime(log.created_at || log.createdAt),
});

const mapBlacklist = (entry) => ({
  ...mapRecord(entry),
  addedAt: entry.addedAt || entry.createdAt || entry.created_at,
});

// ── Get settings (creates default if none exist) ───────────────
exports.get = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("settings").select("*").limit(1).single();
    if (error && error.code !== "PGRST116") return next(toError(error, 500));

    if (data) {
      return res.json({ success: true, settings: mapRecord(data) });
    }

    const { data: created, error: createError } = await supabase.from("settings").insert({}).select("*").single();
    if (createError) return next(toError(createError, 500));

    res.json({ success: true, settings: mapRecord(created) });
  } catch (err) { next(err); }
};

// ── Update settings ────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("settings").select("*").limit(1).single();
    if (error && error.code !== "PGRST116") return next(toError(error, 500));

    if (data) {
      const { data: updated, error: updateError } = await supabase
        .from("settings")
        .update(req.body)
        .eq("id", data.id)
        .select("*")
        .single();
      if (updateError) return next(toError(updateError, 400));

      await audit("Config changed", req.user, req, "Settings updated");
      return res.json({ success: true, settings: mapRecord(updated) });
    }

    const { data: created, error: createError } = await supabase
      .from("settings")
      .insert(req.body)
      .select("*")
      .single();
    if (createError) return next(toError(createError, 400));

    await audit("Config changed", req.user, req, "Settings updated");
    res.json({ success: true, settings: mapRecord(created) });
  } catch (err) { next(err); }
};

// ── Payment settings ───────────────────────────────────────────
exports.getPayment = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("paymentMode,txnFee,razorpayKeyId,enabledMethods")
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") return next(toError(error, 500));

    res.json({ success: true, settings: mapRecord(data || {}) });
  } catch (err) { next(err); }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const { paymentMode, txnFee, razorpayKeyId, enabledMethods } = req.body;
    const { data, error } = await supabase.from("settings").select("*").limit(1).single();
    if (error && error.code !== "PGRST116") return next(toError(error, 500));

    const updates = {};
    if (paymentMode !== undefined) updates.paymentMode = paymentMode;
    if (txnFee !== undefined) updates.txnFee = txnFee;
    if (razorpayKeyId !== undefined) updates.razorpayKeyId = razorpayKeyId;
    if (enabledMethods !== undefined) updates.enabledMethods = enabledMethods;

    if (data) {
      const { data: updated, error: updateError } = await supabase
        .from("settings")
        .update(updates)
        .eq("id", data.id)
        .select("*")
        .single();
      if (updateError) return next(toError(updateError, 400));

      await audit("Payment config updated", req.user, req, `Mode: ${updated.paymentMode}`);
      return res.json({ success: true, settings: mapRecord(updated) });
    }

    const { data: created, error: createError } = await supabase
      .from("settings")
      .insert(updates)
      .select("*")
      .single();
    if (createError) return next(toError(createError, 400));

    await audit("Payment config updated", req.user, req, `Mode: ${created.paymentMode}`);
    res.json({ success: true, settings: mapRecord(created) });
  } catch (err) { next(err); }
};

// ── Audit logs ─────────────────────────────────────────────────
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, user } = req.query;

    let query = supabase.from("audit_logs").select("*", { count: "exact" });
    if (action) query = query.ilike("action", `%${action}%`);
    if (user) query = query.ilike("user", `%${user}%`);

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) return next(toError(error, 500));

    res.json({ success: true, total: count || 0, logs: data.map(mapAuditLog) });
  } catch (err) { next(err); }
};

// ── Blacklist ──────────────────────────────────────────────────
exports.getBlacklist = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("blacklist").select("*").order("created_at", { ascending: false });
    if (error) return next(toError(error, 500));

    res.json({ success: true, blacklist: data.map(mapBlacklist) });
  } catch (err) { next(err); }
};

exports.addBlacklist = async (req, res, next) => {
  try {
    const { phone, reason } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required." });

    const { data, error } = await supabase
      .from("blacklist")
      .insert({ phone, reason, addedBy: req.user.email })
      .select("*")
      .single();
    if (error) return next(toError(error, 400));

    await audit("Phone blacklisted", req.user, req, `${phone}: ${reason}`);
    res.status(201).json({ success: true, entry: mapBlacklist(data) });
  } catch (err) { next(err); }
};

exports.removeBlacklist = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("blacklist")
      .delete()
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Entry not found." });
    if (error) return next(toError(error, 400));

    await audit("Blacklist removed", req.user, req, data.phone);
    res.json({ success: true, message: "Removed from blacklist." });
  } catch (err) { next(err); }
};

// ── CMS ────────────────────────────────────────────────────────
exports.getCMS = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("cms").select("*").order("created_at", { ascending: false });
    if (error) return next(toError(error, 500));

    res.json({ success: true, items: mapRecords(data) });
  } catch (err) { next(err); }
};

exports.updateCMS = async (req, res, next) => {
  try {
    const { _id, ...payload } = req.body;
    let item;

    if (_id) {
      const { data, error } = await supabase
        .from("cms")
        .update(payload)
        .eq("id", _id)
        .select("*")
        .single();
      if (error) return next(toError(error, 400));
      item = data;
    } else {
      const { data, error } = await supabase
        .from("cms")
        .insert(payload)
        .select("*")
        .single();
      if (error) return next(toError(error, 400));
      item = data;
    }

    await audit("CMS updated", req.user, req, item.title);
    res.json({ success: true, item: mapRecord(item) });
  } catch (err) { next(err); }
};

exports.deleteCMS = async (req, res, next) => {
  try {
    const { error } = await supabase.from("cms").delete().eq("id", req.params.id);
    if (error) return next(toError(error, 400));

    res.json({ success: true, message: "Deleted." });
  } catch (err) { next(err); }
};
