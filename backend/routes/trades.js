const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");
const Trade    = require("../models/Trade");
const Holding  = require("../models/Holding");
const User     = require("../models/User");
const { protect }       = require("../middleware/auth");
const { getLivePrice }  = require("../utils/priceService"); 


// const AV_KEY = process.env.ALPHA_VANTAGE_KEY;

// ─── Mock prices fallback ─────────────────────────────────────────
const MOCK_PRICES = {
  AAPL:    189.30,
  MSFT:    415.20,
  GOOGL:   175.80,
  AMZN:    198.50,
  NVDA:    875.40,
  META:    527.30,
  TSLA:    172.60,
  JPM:     234.80,
  V:       312.40,
  "BRK.B": 452.30,
};

function getMockPrice(symbol) {
  const base = MOCK_PRICES[symbol];
  if (!base) return null;
  // small random variation so price feels live
  const variation = (Math.random() - 0.48) * base * 0.008;
  return parseFloat((base + variation).toFixed(2));
}


// ─── POST /api/trades/buy ─────────────────────────────────────────
router.post("/buy", protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { symbol, quantity, companyName } = req.body;
    if (!symbol || !quantity || quantity < 1)
      return res.status(400).json({ success: false, message: "Invalid symbol or quantity" });

    const price = await getLivePrice(symbol.toUpperCase());
    const total = parseFloat((price * quantity).toFixed(2));

    const user = await User.findById(req.user._id).session(session);
    if (user.virtualCash < total) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. You need $${total.toFixed(2)} but have $${user.virtualCash.toFixed(2)}`,
      });
    }

    const cashBefore = user.virtualCash;
    const cashAfter  = parseFloat((cashBefore - total).toFixed(2));

    user.virtualCash = cashAfter;
    await user.save({ session });

    const existing = await Holding.findOne({ user: req.user._id, symbol: symbol.toUpperCase() }).session(session);
    if (existing) {
      const newQty      = existing.quantity + quantity;
      const newInvested = parseFloat((existing.totalInvested + total).toFixed(2));
      existing.quantity      = newQty;
      existing.totalInvested = newInvested;
      existing.avgBuyPrice   = parseFloat((newInvested / newQty).toFixed(2));
      await existing.save({ session });
    } else {
      await Holding.create([{
        user:          req.user._id,
        symbol:        symbol.toUpperCase(),
        companyName:   companyName || symbol,
        quantity,
        avgBuyPrice:   price,
        totalInvested: total,
      }], { session });
    }

    const trade = await Trade.create([{
      user:        req.user._id,
      symbol:      symbol.toUpperCase(),
      companyName: companyName || symbol,
      type:        "BUY",
      quantity,
      price,
      total,
      cashBefore,
      cashAfter,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({
      success:        true,
      message:        `Bought ${quantity} share(s) of ${symbol.toUpperCase()} @ $${price.toFixed(2)}`,
      trade:          trade[0],
      newCashBalance: cashAfter,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

// ─── POST /api/trades/sell ────────────────────────────────────────
router.post("/sell", protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { symbol, quantity, companyName } = req.body;
    if (!symbol || !quantity || quantity < 1)
      return res.status(400).json({ success: false, message: "Invalid symbol or quantity" });

    const price = await getLivePrice(symbol.toUpperCase());
    const total = parseFloat((price * quantity).toFixed(2));

    const holding = await Holding.findOne({ user: req.user._id, symbol: symbol.toUpperCase() }).session(session);
    if (!holding || holding.quantity < quantity) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `You only hold ${holding?.quantity || 0} shares of ${symbol.toUpperCase()}`,
      });
    }

    const user       = await User.findById(req.user._id).session(session);
    const cashBefore = user.virtualCash;
    const cashAfter  = parseFloat((cashBefore + total).toFixed(2));

    user.virtualCash = cashAfter;
    await user.save({ session });

    holding.quantity      -= quantity;
    holding.totalInvested  = parseFloat((holding.avgBuyPrice * holding.quantity).toFixed(2));
    if (holding.quantity === 0) {
      await Holding.deleteOne({ _id: holding._id }).session(session);
    } else {
      await holding.save({ session });
    }

    const trade = await Trade.create([{
      user:        req.user._id,
      symbol:      symbol.toUpperCase(),
      companyName: companyName || symbol,
      type:        "SELL",
      quantity,
      price,
      total,
      cashBefore,
      cashAfter,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({
      success:        true,
      message:        `Sold ${quantity} share(s) of ${symbol.toUpperCase()} @ $${price.toFixed(2)}`,
      trade:          trade[0],
      newCashBalance: cashAfter,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

// ─── GET /api/trades — trade history ─────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type.toUpperCase();
    const trades = await Trade.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(+limit);
    const total = await Trade.countDocuments(filter);
    res.json({
      success: true,
      trades,
      total,
      page:  +page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;