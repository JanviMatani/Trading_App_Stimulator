const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const Trade   = require("../models/Trade");
const { protect } = require("../middleware/auth");

// ─── GET /api/leaderboard/stocks ── MUST BE FIRST ─────────────────
router.get("/stocks", protect, async (req, res) => {
  try {
    const { range = "today" } = req.query;

    const ALL_SYMBOLS = ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","JPM","V","BRK.B"];

    let dateFilter = {};
    const now = new Date();
    if (range === "today") {
      const start = new Date(now); start.setHours(0,0,0,0);
      dateFilter = { createdAt: { $gte: start } };
    } else if (range === "week") {
      const start = new Date(now); start.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: start } };
    } else if (range === "month") {
      const start = new Date(now); start.setDate(now.getDate() - 30);
      dateFilter = { createdAt: { $gte: start } };
    }
    // "all" = no date filter, matches everything

    const traded = await Trade.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id:         "$symbol",
          totalBuys:   { $sum: { $cond: [{ $eq: ["$type","BUY"]  }, 1, 0] } },
          totalSells:  { $sum: { $cond: [{ $eq: ["$type","SELL"] }, 1, 0] } },
          totalTrades: { $sum: 1 },
          totalVolume: { $sum: "$total" },
          totalShares: { $sum: "$quantity" },
          avgPrice:    { $avg: "$price" },
          lastTradeAt: { $max: "$createdAt" },
        },
      },
    ]);

    const tradeMap = {};
    traded.forEach((s) => { tradeMap[s._id] = s; });

    const result = ALL_SYMBOLS.map((symbol) => {
      const t = tradeMap[symbol];
      return {
        symbol,
        totalBuys:   t?.totalBuys   || 0,
        totalSells:  t?.totalSells  || 0,
        totalTrades: t?.totalTrades || 0,
        totalVolume: t?.totalVolume || 0,
        totalShares: t?.totalShares || 0,
        avgPrice:    t?.avgPrice    || 0,
        lastTradeAt: t?.lastTradeAt || null,
      };
    });

    result.sort((a, b) => b.totalTrades - a.totalTrades || b.totalVolume - a.totalVolume);

    const ranked = result.map((s, i) => ({ ...s, rank: i + 1 }));

    res.json({ success: true, stocks: ranked });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/leaderboard ─────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("name virtualCash createdAt");

    const ranked = await Promise.all(
      users.map(async (u) => {
        const tradeCount  = await Trade.countDocuments({ user: u._id });
        const totalReturn = u.virtualCash - 100000;
        const returnPct   = ((totalReturn / 100000) * 100).toFixed(2);
        return {
          userId:      u._id,
          name:        u.name,
          cashBalance: u.virtualCash,
          totalReturn: parseFloat(totalReturn.toFixed(2)),
          returnPct:   parseFloat(returnPct),
          tradeCount,
          joinedAt:    u.createdAt,
        };
      })
    );

    ranked.sort((a, b) => b.returnPct - a.returnPct);
    ranked.forEach((r, i) => (r.rank = i + 1));

    const me = ranked.find((r) => r.userId.toString() === req.user._id.toString());

    res.json({ success: true, leaderboard: ranked, myRank: me || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;