const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const Trade   = require("../models/Trade");
const { protect } = require("../middleware/auth");

// GET /api/leaderboard
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("name virtualCash createdAt");

    const ranked = await Promise.all(
      users.map(async (u) => {
        const tradeCount = await Trade.countDocuments({ user: u._id });
        const totalReturn = u.virtualCash - 100000; // started with $100k
        const returnPct   = ((totalReturn / 100000) * 100).toFixed(2);
        return {
          userId:     u._id,
          name:       u.name,
          cashBalance:u.virtualCash,
          totalReturn:parseFloat(totalReturn.toFixed(2)),
          returnPct:  parseFloat(returnPct),
          tradeCount,
          joinedAt:   u.createdAt,
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