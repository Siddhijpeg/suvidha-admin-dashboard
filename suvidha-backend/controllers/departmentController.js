const { randomUUID } = require("crypto");
const supabase = require("../config/supabase");
const audit = require("../utils/audit");
const { mapRecord } = require("../utils/records");

const toError = (error, statusCode = 500) => ({ statusCode, message: error.message || "Request failed" });

const normalizeServices = async (dept) => {
  if (!dept) return { dept, changed: false };
  const services = Array.isArray(dept.services) ? dept.services : [];
  let changed = false;

  const normalized = services.map((service) => {
    if (!service._id) {
      changed = true;
      return { ...service, _id: randomUUID() };
    }
    return service;
  });

  if (changed) {
    const { error } = await supabase
      .from("departments")
      .update({ services: normalized })
      .eq("id", dept.id);
    if (!error) dept.services = normalized;
  }

  return { dept, changed };
};

// ── Get all departments ────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("departments").select("*").order("name", { ascending: true });
    if (error) return next(toError(error, 500));

    const normalized = [];
    for (const dept of data) {
      const { dept: updated } = await normalizeServices(dept);
      normalized.push(mapRecord(updated));
    }

    res.json({ success: true, departments: normalized });
  } catch (err) { next(err); }
};

// ── Get single ─────────────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 500));

    const { dept: updated } = await normalizeServices(data);
    res.json({ success: true, department: mapRecord(updated) });
  } catch (err) { next(err); }
};

// ── Create ─────────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.services) payload.services = [];

    const { data, error } = await supabase.from("departments").insert(payload).select("*").single();
    if (error) return next(toError(error, 400));

    await audit("Department created", req.user, req, `Created: ${data.name}`);
    res.status(201).json({ success: true, department: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Update ─────────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .update(req.body)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 400));

    await audit("Department updated", req.user, req, `Updated: ${data.name}`);
    res.json({ success: true, department: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Delete ─────────────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .delete()
      .eq("id", req.params.id)
      .select("name")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 400));

    await audit("Department deleted", req.user, req, `Deleted: ${data?.name || req.params.id}`);
    res.json({ success: true, message: "Department deleted." });
  } catch (err) { next(err); }
};

// ── Enable / Disable ───────────────────────────────────────────
exports.enable  = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .update({ enabled: true })
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 400));

    await audit("Department enabled", req.user, req, data.name);
    res.json({ success: true, department: mapRecord(data) });
  } catch (err) { next(err); }
};

exports.disable = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .update({ enabled: false })
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 400));

    await audit("Department disabled", req.user, req, data.name);
    res.json({ success: true, department: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Service CRUD ───────────────────────────────────────────────
exports.getServices = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("id,services")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 500));

    const { dept: updated } = await normalizeServices(data);
    const services = Array.isArray(updated.services) ? updated.services : [];
    res.json({ success: true, services });
  } catch (err) { next(err); }
};

exports.createService = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("name,services")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 500));

    const services = Array.isArray(data.services) ? data.services : [];
    const newService = { ...req.body, _id: randomUUID() };
    services.push(newService);

    const { error: updateError } = await supabase
      .from("departments")
      .update({ services })
      .eq("id", req.params.id);
    if (updateError) return next(toError(updateError, 400));

    await audit("Service added", req.user, req, `${data.name}: ${newService.name}`);
    res.status(201).json({ success: true, service: newService });
  } catch (err) { next(err); }
};

exports.updateService = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("services")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 500));

    const services = Array.isArray(data.services) ? data.services : [];
    const idx = services.findIndex((service) => service._id === req.params.serviceId);
    if (idx === -1) return res.status(404).json({ message: "Service not found." });

    services[idx] = { ...services[idx], ...req.body };

    const { error: updateError } = await supabase
      .from("departments")
      .update({ services })
      .eq("id", req.params.id);
    if (updateError) return next(toError(updateError, 400));

    res.json({ success: true, service: services[idx] });
  } catch (err) { next(err); }
};

exports.deleteService = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("services")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 500));

    const services = Array.isArray(data.services) ? data.services : [];
    const nextServices = services.filter((service) => service._id !== req.params.serviceId);
    if (nextServices.length === services.length) return res.status(404).json({ message: "Service not found." });

    const { error: updateError } = await supabase
      .from("departments")
      .update({ services: nextServices })
      .eq("id", req.params.id);
    if (updateError) return next(toError(updateError, 400));

    res.json({ success: true, message: "Service deleted." });
  } catch (err) { next(err); }
};

exports.enableService = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("services")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 500));

    const services = Array.isArray(data.services) ? data.services : [];
    const idx = services.findIndex((service) => service._id === req.params.serviceId);
    if (idx === -1) return res.status(404).json({ message: "Service not found." });

    services[idx].enabled = true;

    const { error: updateError } = await supabase
      .from("departments")
      .update({ services })
      .eq("id", req.params.id);
    if (updateError) return next(toError(updateError, 400));

    res.json({ success: true, service: services[idx] });
  } catch (err) { next(err); }
};

exports.disableService = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("services")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Department not found." });
    if (error) return next(toError(error, 500));

    const services = Array.isArray(data.services) ? data.services : [];
    const idx = services.findIndex((service) => service._id === req.params.serviceId);
    if (idx === -1) return res.status(404).json({ message: "Service not found." });

    services[idx].enabled = false;

    const { error: updateError } = await supabase
      .from("departments")
      .update({ services })
      .eq("id", req.params.id);
    if (updateError) return next(toError(updateError, 400));

    res.json({ success: true, service: services[idx] });
  } catch (err) { next(err); }
};
