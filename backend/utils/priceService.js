const axios = require("axios");

const AV_KEY    = process.env.ALPHA_VANTAGE_KEY;
const cache     = {};
const CACHE_TTL = 60 * 1000;

// Mock prices as final fallback
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
  const variation = (Math.random() - 0.48) * base * 0.008;
  return parseFloat((base + variation).toFixed(2));
}

function getCached(symbol) {
  const entry = cache[symbol];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { delete cache[symbol]; return null; }
  return entry.price;
}

function setCached(symbol, price) {
  cache[symbol] = { price, ts: Date.now() };
}

async function getLivePrice(symbol) {
  const sym = symbol.toUpperCase();

  // 1. Check cache first
  const cached = getCached(sym);
  if (cached) {
    console.log(`[price] ${sym} from cache: $${cached}`);
    return cached;
  }

  // 2. Try Alpha Vantage
  try {
    const { data } = await axios.get("https://www.alphavantage.co/query", {
      params: { function: "GLOBAL_QUOTE", symbol: sym, apikey: AV_KEY },
      timeout: 8000,
    });

    const q     = data["Global Quote"];
    const price = q && parseFloat(q["05. price"]);

    if (price && price > 0) {
      console.log(`[price] ${sym} from API: $${price}`);
      setCached(sym, price);
      return price;
    }

    // API returned empty — use mock
    throw new Error("Empty API response");

  } catch (err) {
    // 3. Fall back to mock — NEVER throw, always return a price
    const mock = getMockPrice(sym);
    if (mock) {
      console.log(`[price] ${sym} using mock: $${mock} (reason: ${err.message})`);
      setCached(sym, mock);
      return mock;
    }

    // 4. Last resort — throw only if symbol completely unknown
    throw new Error(`Unknown symbol: ${sym}`);
  }
}

module.exports = { getLivePrice, getCached, setCached };