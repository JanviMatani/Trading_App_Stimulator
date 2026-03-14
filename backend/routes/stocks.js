const express  = require("express");
const axios    = require("axios");
const { protect }                    = require("../middleware/auth");
const { getLivePrice, setCached }    = require("../utils/priceService");

const router = express.Router();

// ─── Mock prices (fallback when API limit hit) ────────────────────
const MOCK_PRICES = {
  AAPL:    { price: 189.30, open: 188.50, high: 191.20, low: 187.80, prevClose: 188.10, change: 1.20,  changePct: 0.64,  volume: 52341000, latestTradingDay: "2025-03-14", name: "Apple Inc."         },
  MSFT:    { price: 415.20, open: 413.00, high: 417.50, low: 412.30, prevClose: 413.80, change: 1.40,  changePct: 0.34,  volume: 21234000, latestTradingDay: "2025-03-14", name: "Microsoft Corp."     },
  GOOGL:   { price: 175.80, open: 174.20, high: 176.90, low: 173.50, prevClose: 174.60, change: 1.20,  changePct: 0.69,  volume: 18923000, latestTradingDay: "2025-03-14", name: "Alphabet Inc."       },
  AMZN:    { price: 198.50, open: 196.80, high: 199.70, low: 196.10, prevClose: 197.20, change: 1.30,  changePct: 0.66,  volume: 31234000, latestTradingDay: "2025-03-14", name: "Amazon.com"          },
  NVDA:    { price: 875.40, open: 868.00, high: 880.20, low: 865.30, prevClose: 869.10, change: 6.30,  changePct: 0.73,  volume: 42341000, latestTradingDay: "2025-03-14", name: "NVIDIA Corp."        },
  META:    { price: 527.30, open: 523.40, high: 529.80, low: 522.10, prevClose: 524.60, change: 2.70,  changePct: 0.52,  volume: 14523000, latestTradingDay: "2025-03-14", name: "Meta Platforms"      },
  TSLA:    { price: 172.60, open: 170.20, high: 174.80, low: 169.50, prevClose: 171.30, change: 1.30,  changePct: 0.76,  volume: 89234000, latestTradingDay: "2025-03-14", name: "Tesla Inc."          },
  JPM:     { price: 234.80, open: 233.10, high: 235.90, low: 232.40, prevClose: 233.50, change: 1.30,  changePct: 0.56,  volume: 9823000,  latestTradingDay: "2025-03-14", name: "JPMorgan Chase"      },
  V:       { price: 312.40, open: 310.80, high: 313.50, low: 310.20, prevClose: 311.20, change: 1.20,  changePct: 0.39,  volume: 7234000,  latestTradingDay: "2025-03-14", name: "Visa Inc."           },
  "BRK.B": { price: 452.30, open: 450.10, high: 453.80, low: 449.60, prevClose: 451.20, change: 1.10,  changePct: 0.24,  volume: 3421000,  latestTradingDay: "2025-03-14", name: "Berkshire Hathaway"  },
};

// Add small random variation to mock prices so they feel "live"
function getLiveMock(symbol) {
  const base = MOCK_PRICES[symbol];
  if (!base) return null;
  const variation = (Math.random() - 0.48) * base.price * 0.008;
  const price     = parseFloat((base.price + variation).toFixed(2));
  const change    = parseFloat((price - base.prevClose).toFixed(2));
  const changePct = parseFloat(((change / base.prevClose) * 100).toFixed(2));
  return { ...base, price, change, changePct };
}

// ─── Server-side cache (60 seconds) ──────────────────────────────
const cache     = {};
const CACHE_TTL = 60 * 1000;

function getFromCache(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { delete cache[key]; return null; }
  return entry.data;
}

function setToCache(key, data) {
  cache[key] = { data, ts: Date.now() };
}

// ─── GET /api/stocks — all 10 stocks ─────────────────────────────
router.get("/", protect, async (req, res) => {
  const cached = getFromCache("ALL_STOCKS");
  if (cached) return res.json({ stocks: cached, source: "cache" });

  const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "BRK.B"];
  const results = [];
  let   usedMock = false;

  for (const symbol of symbols) {
    const symCache = getFromCache(symbol);
    if (symCache) { results.push(symCache); continue; }

    try {
      const { data } = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
      );

      const q = data["Global Quote"];

      if (!q || !q["05. price"] || parseFloat(q["05. price"]) === 0) {
        // API limit hit or empty response — use mock
        const mock = getLiveMock(symbol);
        if (mock) { results.push({ symbol, ...mock }); usedMock = true; }
        continue;
      }

      const stock = {
        symbol,
        name:             MOCK_PRICES[symbol]?.name || symbol,
        price:            parseFloat(q["05. price"]),
        open:             parseFloat(q["02. open"]),
        high:             parseFloat(q["03. high"]),
        low:              parseFloat(q["04. low"]),
        prevClose:        parseFloat(q["08. previous close"]),
        change:           parseFloat(q["09. change"]),
        changePct:        parseFloat(q["10. change percent"]),
        volume:           parseInt(q["06. volume"]),
        latestTradingDay: q["07. latest trading day"],
      };

      setToCache(symbol, stock);
      results.push(stock);

    } catch (err) {
      // Network error — use mock
      const mock = getLiveMock(symbol);
      if (mock) { results.push({ symbol, ...mock }); usedMock = true; }
    }
  }

  setToCache("ALL_STOCKS", results);
  res.json({ stocks: results, source: usedMock ? "mock" : "live" });
});

// ─── GET /api/stocks/:symbol — single stock ───────────────────────
router.get("/:symbol", protect, async (req, res) => {
  const { symbol } = req.params;
  const sym        = symbol.toUpperCase();

  // Check cache first
  const cached = getFromCache(sym);
  if (cached) return res.json({ stock: cached, source: "cache" });

  try {
    const { data } = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
    );

    const q = data["Global Quote"];

    // If API limit hit or empty — fall back to mock
    if (!q || !q["05. price"] || parseFloat(q["05. price"]) === 0) {
      const mock = getLiveMock(sym);
      if (mock) return res.json({ stock: { symbol: sym, ...mock }, source: "mock" });
      return res.status(404).json({ message: "Stock not found" });
    }

    const stock = {
      symbol:           sym,
      name:             MOCK_PRICES[sym]?.name || sym,
      price:            parseFloat(q["05. price"]),
      open:             parseFloat(q["02. open"]),
      high:             parseFloat(q["03. high"]),
      low:              parseFloat(q["04. low"]),
      prevClose:        parseFloat(q["08. previous close"]),
      change:           parseFloat(q["09. change"]),
      changePct:        parseFloat(q["10. change percent"]),
      volume:           parseInt(q["06. volume"]),
      latestTradingDay: q["07. latest trading day"],
    };

    setToCache(sym, stock);
    res.json({ stock, source: "live" });

  } catch (err) {
    // Network/server error — fall back to mock
    const mock = getLiveMock(sym);
    if (mock) return res.json({ stock: { symbol: sym, ...mock }, source: "mock" });
    res.status(500).json({ message: "Failed to fetch stock data" });
  }
});

module.exports = router;