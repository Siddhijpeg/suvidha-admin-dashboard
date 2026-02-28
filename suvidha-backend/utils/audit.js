const { AuditLog } = require("../models/Settings");

const audit = async (action, user, req, detail = "") => {
  try {
    await AuditLog.create({
      action,
      user:   user?.email || "system",
      role:   user?.role  || "",
      ip:     req?.ip || req?.headers?.["x-forwarded-for"] || "",
      detail,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

module.exports = audit;
