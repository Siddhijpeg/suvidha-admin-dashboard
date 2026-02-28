const supabase = require("../config/supabase");
const audit = require("../utils/audit");
const { mapRecord, mapRecords } = require("../utils/records");

const toError = (error, statusCode = 500) => ({ statusCode, message: error.message || "Request failed" });

// ── Get all complaints ─────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { status, dept, priority, search, page = 1, limit = 20 } = req.query;

    let query = supabase.from("complaints").select("*", { count: "exact" });
    if (status) query = query.eq("status", status);
    if (dept) query = query.ilike("deptName", `%${dept}%`);
    if (priority) query = query.eq("priority", priority);
    if (search) {
      query = query.or(`complaintId.ilike.%${search}%,category.ilike.%${search}%,account.ilike.%${search}%`);
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) return next(toError(error, 500));

    res.json({ success: true, total: count || 0, complaints: mapRecords(data) });
  } catch (err) { next(err); }
};

// ── Get single complaint ───────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Complaint not found." });
    if (error) return next(toError(error, 500));

    res.json({ success: true, complaint: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Update status + remarks ────────────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Complaint not found." });
    if (error) return next(toError(error, 500));

    const history = Array.isArray(data.history) ? data.history : [];
    history.push({
      status,
      changedBy: req.user?.email || "system",
      note: remarks || "",
      changedAt: new Date().toISOString(),
    });

    const updates = {
      status,
      resolution: remarks || data.resolution,
      history,
    };

    if (status === "resolved" || status === "closed") {
      updates.resolvedAt = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabase
      .from("complaints")
      .update(updates)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (updateError) return next(toError(updateError, 400));

    await audit("Complaint status updated", req.user, req, `${data.complaintId}: ${data.status} → ${status}`);
    res.json({ success: true, complaint: mapRecord(updated) });
  } catch (err) { next(err); }
};

// ── Assign to operator ─────────────────────────────────────────
exports.assign = async (req, res, next) => {
  try {
    const { operatorId } = req.body;
    const { data, error } = await supabase
      .from("complaints")
      .update({ assignedTo: operatorId, status: "in_progress" })
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Complaint not found." });
    if (error) return next(toError(error, 400));

    await audit("Complaint assigned", req.user, req, `${data.complaintId} assigned to ${operatorId}`);
    res.json({ success: true, complaint: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Escalate ───────────────────────────────────────────────────
exports.escalate = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .update({ status: "escalated", escalatedAt: new Date().toISOString() })
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error && error.code === "PGRST116") return res.status(404).json({ message: "Complaint not found." });
    if (error) return next(toError(error, 400));

    await audit("Complaint escalated", req.user, req, `${data.complaintId} escalated`);
    res.json({ success: true, complaint: mapRecord(data) });
  } catch (err) { next(err); }
};

// ── Stats ──────────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("complaints").select("status");
    if (error) return next(toError(error, 500));

    const counts = data.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {});

    const stats = Object.entries(counts).map(([status, count]) => ({ _id: status, count }));
    res.json({ success: true, stats });
  } catch (err) { next(err); }
};
