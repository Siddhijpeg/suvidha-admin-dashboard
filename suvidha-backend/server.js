require("dotenv").config({ path: __dirname + "/.env" });
const express     = require("express");
const cors        = require("cors");
const helmet      = require("helmet");
const morgan      = require("morgan");
const rateLimit   = require("express-rate-limit");
const connectDB   = require("./config/db");
const errorHandler= require("./middleware/errorHandler");

// ── Connect DB ─────────────────────────────────────────────────
connectDB();

const app = express();

// ── Security middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

// ── Rate limiting ──────────────────────────────────────────────
app.use("/api/auth/login", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many login attempts. Please try again later." },
}));
app.use("/api/", rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
}));

// ── Body parser ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Logger (dev only) ──────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Health check ───────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date(), env: process.env.NODE_ENV });
});

// ── API Routes ─────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/kiosks",       require("./routes/kiosks"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/complaints",   require("./routes/complaints"));
app.use("/api/departments",  require("./routes/departments"));
app.use("/api/analytics",    require("./routes/analytics"));
app.use("/api/settings",     require("./routes/settings"));

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// ── Central error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`\n🚀 SUVIDHA Backend running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});
