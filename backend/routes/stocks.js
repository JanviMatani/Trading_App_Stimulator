const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const { protect } = require("../middleware/auth");

const AV_KEY = process.env.ALPHA_VANTAGE_KEY;
const AV_BASE = "https://www.alphavantage.co/query";

const SYMBOLS = [
  { sym: "AAPL",  name: "Apple Inc."          },
  { sym: "MSFT",  name: "Microsoft Corp."     },
  { sym: "GOOGL", name: "Alphabet Inc."       },
  { sym: "AMZN",  name: "Amazon.com Inc."     },
  { sym: "NVDA",  name: "NVIDIA Corp."        },
  { sym: "META",  name: "Meta Platforms"      },
  { sym: "TSLA",  name: "Tesla Inc."          },
  { sym: "JPM",   name: "JPMorgan Chase"      },
  { sym: "V",     name: "Visa Inc."           },
  { sym: "BRK.B", name: "Berkshire Hathaway" },
];

// Simple in-memory cache (60s)
let cache = { data: [], fetchedAt: 0 };

async function fetchQuote(sym) {
  const { data } = await axios.get(AV_BASE, {
    params: { function: "GLOBAL_QUOTE", symbol: sym, apikey: AV_KEY },
    timeout: 8000,
  });
  const q = data["Global Quote"];
  if (!q || !q["05. price"]) return null;
  return {
    symbol:         q["01. symbol"],
    price:          parseFloat(q["05. price"]),
    open:           parseFloat(q["02. open"]),
    high:           parseFloat(q["03. high"]),
    low:            parseFloat(q["04. low"]),
    prevClose:      parseFloat(q["08. previous close"]),
    change:         parseFloat(q["09. change"]),
    changePct:      parseFloat(q["10. change percent"]),
    volume:         parseInt(q["06. volume"]),
    latestTradingDay: q["07. latest trading day"],
  };
}

// GET /api/stocks  — all quotes (cached 60s)
router.get("/", protect, async (req, res) => {
  try {
    const now = Date.now();
    if (cache.data.length && now - cache.fetchedAt < 60000) {
      return res.json({ success: true, cached: true, stocks: cache.data });
    }
    const results = [];
    for (const { sym, name } of SYMBOLS) {
      const q = await fetchQuote(sym);
      if (q) results.push({ ...q, name });
      await new Promise((r) => setTimeout(r, 300)); // respect free tier
    }
    cache = { data: results, fetchedAt: now };
    res.json({ success: true, cached: false, stocks: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/stocks/:symbol  — single quote
router.get("/:symbol", protect, async (req, res) => {
  try {
    const sym = req.params.symbol.toUpperCase();
    const meta = SYMBOLS.find((s) => s.sym === sym);
    const q = await fetchQuote(sym);
    if (!q) return res.status(404).json({ success: false, message: "Symbol not found" });
    res.json({ success: true, stock: { ...q, name: meta?.name || sym } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;