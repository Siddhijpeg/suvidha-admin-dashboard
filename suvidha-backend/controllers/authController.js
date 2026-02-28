const supabase = require("../config/supabase");
const audit = require("../utils/audit");
const { mapRecord, mapRecords } = require("../utils/records");

const toError = (error, statusCode = 500) => ({ statusCode, message: error.message || "Request failed" });

// ── Register (Super Admin only) ────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, department },
    });

    if (createError || !created?.user) {
      return next(toError(createError || new Error("Unable to create user"), 400));
    }

    const profilePayload = {
      id: created.user.id,
      name,
      email,
      role,
      department,
      is_active: true,
    };

    const { error: profileError } = await supabase.from("profiles").insert(profilePayload);
    if (profileError) return next(toError(profileError, 400));

    await audit("User created", req.user, req, `Created user: ${email} (${role})`);

    res.status(201).json({
      success: true,
      user: { _id: created.user.id, name, email, role, department },
    });
  } catch (err) {
    next(err);
  }
};

// ── Login ──────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return next(toError(error, 401));
    }

    res.json({
      success: true,
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
};

// ── Get current user ───────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", req.user.id).single();
    if (error && error.code !== "PGRST116") return next(toError(error, 500));

    res.json({
      success: true,
      user: data ? { ...mapRecord(data), ...req.user } : req.user,
    });
  } catch (err) {
    next(err);
  }
};

// ── Get all users (Super Admin) ────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) return next(toError(error, 500));

    res.json({ success: true, users: mapRecords(data) });
  } catch (err) {
    next(err);
  }
};

// ── Update user ────────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, department, isActive } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) return next(toError(error, 500));
    if (!data) return res.status(404).json({ message: "User not found." });

    await supabase.auth.admin.updateUserById(req.params.id, {
      user_metadata: { name: data.name, role: data.role, department: data.department, is_active: data.is_active },
    });

    await audit("User updated", req.user, req, `Updated: ${data.email}`);
    res.json({ success: true, user: mapRecord(data) });
  } catch (err) {
    next(err);
  }
};

// ── Delete user ────────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(req.params.id);
    if (authError) return next(toError(authError, 500));

    await supabase.from("profiles").delete().eq("id", req.params.id);
    await audit("User deleted", req.user, req, `Deleted: ${req.params.id}`);

    res.json({ success: true, message: "User deleted." });
  } catch (err) {
    next(err);
  }
};
