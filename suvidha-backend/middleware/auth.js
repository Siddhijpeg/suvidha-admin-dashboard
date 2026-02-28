const supabase = require("../config/supabase");

// ── Protect Route (Verify Supabase Token) ──────────────────────
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = data.user;
    next();

  } catch (err) {
    next(err);
  }
};

// ── Role Guard (Using Supabase user_metadata) ─────────────────
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.user_metadata?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};