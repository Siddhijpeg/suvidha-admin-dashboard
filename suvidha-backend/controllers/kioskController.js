const Kiosk = require("../models/Kiosk");
const audit = require("../utils/audit");

// ── Get all kiosks ─────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { status, city, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city)   filter.city   = new RegExp(city, "i");
    if (search) filter.$or = [
      { kioskId:  new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
      { city:     new RegExp(search, "i") },
    ];
    const kiosks = await Kiosk.find(filter).sort({ kioskId: 1 });
    res.json({ success: true, kiosks });
  } catch (err) { next(err); }
};

// ── Get single kiosk ───────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const kiosk = await Kiosk.findById(req.params.id);
    if (!kiosk) return res.status(404).json({ message: "Kiosk not found." });
    res.json({ success: true, kiosk });
  } catch (err) { next(err); }
};

// ── Create kiosk ───────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const kiosk = await Kiosk.create(req.body);
    await audit("Kiosk created", req.user, req, `Created: ${kiosk.kioskId}`);
    res.status(201).json({ success: true, kiosk });
  } catch (err) { next(err); }
};

// ── Update kiosk ───────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const kiosk = await Kiosk.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!kiosk) return res.status(404).json({ message: "Kiosk not found." });
    res.json({ success: true, kiosk });
  } catch (err) { next(err); }
};

// ── Remote actions ─────────────────────────────────────────────
const remoteAction = (newStatus, actionName) => async (req, res, next) => {
  try {
    const update = { status: newStatus };
    if (newStatus === "online") update.lastOnline = new Date();
    const kiosk = await Kiosk.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!kiosk) return res.status(404).json({ message: "Kiosk not found." });
    await audit(`Kiosk ${actionName}`, req.user, req, `${actionName}: ${kiosk.kioskId}`);
    res.json({ success: true, kiosk, message: `Kiosk ${actionName} successfully.` });
  } catch (err) { next(err); }
};

exports.enable      = remoteAction("online",      "enabled");
exports.disable     = remoteAction("offline",     "disabled");
exports.maintenance = remoteAction("maintenance", "set to maintenance");

exports.forceLogout = async (req, res, next) => {
  try {
    const kiosk = await Kiosk.findByIdAndUpdate(req.params.id, { currentSession: "None" }, { new: true });
    if (!kiosk) return res.status(404).json({ message: "Kiosk not found." });
    await audit("Kiosk force logout", req.user, req, `Force logout: ${kiosk.kioskId}`);
    res.json({ success: true, message: "Session terminated." });
  } catch (err) { next(err); }
};

exports.restart = async (req, res, next) => {
  try {
    const kiosk = await Kiosk.findById(req.params.id);
    if (!kiosk) return res.status(404).json({ message: "Kiosk not found." });
    // In production: send restart command via WebSocket / MQTT to the kiosk
    await audit("Kiosk restart", req.user, req, `Restart requested: ${kiosk.kioskId}`);
    res.json({ success: true, message: "Restart signal sent." });
  } catch (err) { next(err); }
};

exports.pushUpdate = async (req, res, next) => {
  try {
    const kiosk = await Kiosk.findById(req.params.id);
    if (!kiosk) return res.status(404).json({ message: "Kiosk not found." });
    // In production: send update payload via WebSocket / MQTT
    await audit("Software update pushed", req.user, req, `Update pushed to: ${kiosk.kioskId}`);
    res.json({ success: true, message: "Update pushed successfully." });
  } catch (err) { next(err); }
};

// ── Kiosk stats ────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const kiosk = await Kiosk.findById(req.params.id);
    if (!kiosk) return res.status(404).json({ message: "Kiosk not found." });
    res.json({ success: true, stats: { totalSessions: kiosk.totalSessions, todaySessions: kiosk.todaySessions, uptime: kiosk.uptime } });
  } catch (err) { next(err); }
};
