const supabase = require("../config/supabase");
const audit = require("../utils/audit");
const { mapRecord, mapRecords } = require("../utils/records");

const toError = (error, statusCode = 500) => ({ statusCode, message: error.message || "Request failed" });

// ── Get all kiosks ─────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { status, city, search } = req.query;

    let query = supabase.from("kiosks").select("*");
    if (status) query = query.eq("status", status);
    if (city) query = query.ilike("city", `%${city}%`);
    if (search) {
      query = query.or(`kioskId.ilike.%${search}%,location.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const { data, error } = await query.order("kioskId", { ascending: true });
    if (error) return next(toError(error, 500));

    res.json({ success: true, kiosks: mapRecords(data) });
  } catch (err) { next(err); }
};

// ── Get single kiosk ───────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("kiosks")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Kiosk not found." });
    if (error) return next(toError(error, 500));

    res.json({ success: true, kiosk: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Create kiosk ───────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("kiosks").insert(req.body).select("*").single();
    if (error) return next(toError(error, 400));

    await audit("Kiosk created", req.user, req, `Created: ${data.kioskId}`);
    res.status(201).json({ success: true, kiosk: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Update kiosk ───────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("kiosks")
      .update(req.body)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Kiosk not found." });
    if (error) return next(toError(error, 400));

    res.json({ success: true, kiosk: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Remote actions ─────────────────────────────────────────────
const remoteAction = (newStatus, actionName) => async (req, res, next) => {
  try {
    const update = { status: newStatus };
    if (newStatus === "online") update.lastOnline = new Date().toISOString();

    const { data, error } = await supabase
      .from("kiosks")
      .update(update)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Kiosk not found." });
    if (error) return next(toError(error, 400));

    await audit(`Kiosk ${actionName}`, req.user, req, `${actionName}: ${data.kioskId}`);
    res.json({ success: true, kiosk: mapRecord(data), message: `Kiosk ${actionName} successfully.` });
  } catch (err) { next(err); }
};

exports.enable      = remoteAction("online",      "enabled");
exports.disable     = remoteAction("offline",     "disabled");
exports.maintenance = remoteAction("maintenance", "set to maintenance");

exports.forceLogout = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("kiosks")
      .update({ currentSession: "None" })
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Kiosk not found." });
    if (error) return next(toError(error, 400));

    await audit("Kiosk force logout", req.user, req, `Force logout: ${data.kioskId}`);
    res.json({ success: true, message: "Session terminated." });
  } catch (err) { next(err); }
};

exports.restart = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("kiosks")
      .select("kioskId")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Kiosk not found." });
    if (error) return next(toError(error, 500));

    // In production: send restart command via WebSocket / MQTT to the kiosk
    await audit("Kiosk restart", req.user, req, `Restart requested: ${data.kioskId}`);
    res.json({ success: true, message: "Restart signal sent." });
  } catch (err) { next(err); }
};

exports.pushUpdate = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("kiosks")
      .select("kioskId")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Kiosk not found." });
    if (error) return next(toError(error, 500));

    // In production: send update payload via WebSocket / MQTT
    await audit("Software update pushed", req.user, req, `Update pushed to: ${data.kioskId}`);
    res.json({ success: true, message: "Update pushed successfully." });
  } catch (err) { next(err); }
};

// ── Kiosk stats ────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("kiosks")
      .select("totalSessions,todaySessions,uptime")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Kiosk not found." });
    if (error) return next(toError(error, 500));

    res.json({ success: true, stats: data });
  } catch (err) { next(err); }
};
