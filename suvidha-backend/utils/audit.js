const supabase = require("../config/supabase");

const audit = async (action, user, req, detail = "") => {
  try {
    const payload = {
      action,
      user:   user?.email || "system",
      role:   user?.user_metadata?.role || "",
      ip:     req?.ip || req?.headers?.["x-forwarded-for"] || "",
      detail,
    };

    const { error } = await supabase.from("audit_logs").insert(payload);
    if (error) throw error;
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

module.exports = audit;
