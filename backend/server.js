const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", process.env.CLIENT_URL].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// ── Routes ──────────────────────────────────────────
app.use("/api/auth",        require("./routes/auth"));
app.use("/api/stocks",      require("./routes/stocks"));
app.use("/api/trades",      require("./routes/trades"));
app.use("/api/portfolio",   require("./routes/portfolio"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/chat",        require("./routes/chat"));
app.use("/api/news",        require("./routes/news"));

// ── Health check ─────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// ── Error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server Error" });
});

// ── DB + Start ────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => { console.error("❌ MongoDB error:", err); process.exit(1); });