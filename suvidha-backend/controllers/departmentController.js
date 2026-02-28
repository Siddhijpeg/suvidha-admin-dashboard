const Department = require("../models/Department");
const audit      = require("../utils/audit");

// ── Get all departments ────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (err) { next(err); }
};

// ── Get single ─────────────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found." });
    res.json({ success: true, department: dept });
  } catch (err) { next(err); }
};

// ── Create ─────────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const dept = await Department.create(req.body);
    await audit("Department created", req.user, req, `Created: ${dept.name}`);
    res.status(201).json({ success: true, department: dept });
  } catch (err) { next(err); }
};

// ── Update ─────────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ message: "Department not found." });
    await audit("Department updated", req.user, req, `Updated: ${dept.name}`);
    res.json({ success: true, department: dept });
  } catch (err) { next(err); }
};

// ── Delete ─────────────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found." });
    await audit("Department deleted", req.user, req, `Deleted: ${dept.name}`);
    res.json({ success: true, message: "Department deleted." });
  } catch (err) { next(err); }
};

// ── Enable / Disable ───────────────────────────────────────────
exports.enable  = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, { enabled: true },  { new: true });
    if (!dept) return res.status(404).json({ message: "Department not found." });
    await audit("Department enabled", req.user, req, dept.name);
    res.json({ success: true, department: dept });
  } catch (err) { next(err); }
};

exports.disable = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, { enabled: false }, { new: true });
    if (!dept) return res.status(404).json({ message: "Department not found." });
    await audit("Department disabled", req.user, req, dept.name);
    res.json({ success: true, department: dept });
  } catch (err) { next(err); }
};

// ── Service CRUD ───────────────────────────────────────────────
exports.getServices = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found." });
    res.json({ success: true, services: dept.services });
  } catch (err) { next(err); }
};

exports.createService = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found." });
    dept.services.push(req.body);
    await dept.save();
    const newSvc = dept.services[dept.services.length - 1];
    await audit("Service added", req.user, req, `${dept.name}: ${newSvc.name}`);
    res.status(201).json({ success: true, service: newSvc });
  } catch (err) { next(err); }
};

exports.updateService = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found." });
    const svc = dept.services.id(req.params.serviceId);
    if (!svc) return res.status(404).json({ message: "Service not found." });
    Object.assign(svc, req.body);
    await dept.save();
    res.json({ success: true, service: svc });
  } catch (err) { next(err); }
};

exports.deleteService = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found." });
    dept.services.pull({ _id: req.params.serviceId });
    await dept.save();
    res.json({ success: true, message: "Service deleted." });
  } catch (err) { next(err); }
};

exports.enableService = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    const svc  = dept?.services.id(req.params.serviceId);
    if (!svc) return res.status(404).json({ message: "Service not found." });
    svc.enabled = true;
    await dept.save();
    res.json({ success: true, service: svc });
  } catch (err) { next(err); }
};

exports.disableService = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    const svc  = dept?.services.id(req.params.serviceId);
    if (!svc) return res.status(404).json({ message: "Service not found." });
    svc.enabled = false;
    await dept.save();
    res.json({ success: true, service: svc });
  } catch (err) { next(err); }
};
