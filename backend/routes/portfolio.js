const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const Holding = require("../models/Holding");
const Trade   = require("../models/Trade");
const { protect } = require("../middleware/auth");

const AV_KEY = process.env.ALPHA_VANTAGE_KEY;

async function getLivePrice(symbol) {
  try {
    const { data } = await axios.get("https://www.alphavantage.co/query", {
      params: { function: "GLOBAL_QUOTE", symbol, apikey: AV_KEY },
      timeout: 6000,
    });
    const q = data["Global Quote"];
    return q?.["05. price"] ? parseFloat(q["05. price"]) : null;
  } catch { return null; }
}

// GET /api/portfolio  — holdings with live prices
router.get("/", protect, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });
    const enriched = await Promise.all(
      holdings.map(async (h) => {
        const livePrice = await getLivePrice(h.symbol);
        const currentValue = livePrice ? livePrice * h.quantity : h.totalInvested;
        const unrealizedPnl = livePrice
          ? parseFloat(((livePrice - h.avgBuyPrice) * h.quantity).toFixed(2))
          : 0;
        const pnlPct = ((unrealizedPnl / h.totalInvested) * 100).toFixed(2);
        return {
          symbol:       h.symbol,
          companyName:  h.companyName,
          quantity:     h.quantity,
          avgBuyPrice:  h.avgBuyPrice,
          totalInvested:h.totalInvested,
          currentPrice: livePrice || h.avgBuyPrice,
          currentValue: parseFloat(currentValue.toFixed(2)),
          unrealizedPnl,
          pnlPct: parseFloat(pnlPct),
        };
      })
    );

    const totalInvested    = enriched.reduce((a, h) => a + h.totalInvested, 0);
    const totalCurrentValue= enriched.reduce((a, h) => a + h.currentValue, 0);
    const totalPnl         = parseFloat((totalCurrentValue - totalInvested).toFixed(2));

    res.json({
      success: true,
      holdings: enriched,
      summary: {
        totalInvested:    parseFloat(totalInvested.toFixed(2)),
        totalCurrentValue:parseFloat(totalCurrentValue.toFixed(2)),
        totalPnl,
        pnlPct: totalInvested > 0
          ? parseFloat(((totalPnl / totalInvested) * 100).toFixed(2))
          : 0,
        cashBalance: req.user.virtualCash,
        totalPortfolioValue: parseFloat((totalCurrentValue + req.user.virtualCash).toFixed(2)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;