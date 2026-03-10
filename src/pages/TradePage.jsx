import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, CardHead, Spinner, Button, Input, Alert, Ic, I, fmt$ } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const SYMBOLS = ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","JPM","V","BRK.B"];
const NAMES   = {
  AAPL:"Apple Inc.", MSFT:"Microsoft", GOOGL:"Alphabet",
  AMZN:"Amazon", NVDA:"NVIDIA", META:"Meta",
  TSLA:"Tesla", JPM:"JPMorgan", "BRK.B":"Berkshire", V:"Visa"
};

function ReceiptModal({ trade, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-600 w-full max-w-sm"
        style={{ animation: "fadeUp .3s ease both" }}>
        <div className={`h-1.5 w-full ${trade.type === "BUY" ? "bg-emerald-500" : "bg-red-500"}`} />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 flex items-center justify-center ${trade.type === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              <Ic d={trade.type === "BUY" ? I.buy : I.sell} size={20} />
            </div>
            <div>
              <p className="text-white font-black text-lg" style={{ fontFamily: "Georgia,serif" }}>Order Executed</p>
              <p className={`text-xs font-bold tracking-widest ${trade.type === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                {trade.type} ORDER · CONFIRMED
              </p>
            </div>
          </div>

          {[
            ["Stock",       trade.symbol],
            ["Type",        trade.type],
            ["Quantity",    trade.quantity + " shares"],
            ["Price/Share", "$" + fmt$(trade.price)],
            ["Total",       "$" + fmt$(trade.total)],
            ["New Balance", "$" + fmt$(trade.newCashBalance)],
          ].map(([label, val], i) => (
            <div key={i} className={`flex justify-between py-2.5 ${i < 5 ? "border-b border-slate-700" : ""}`}>
              <span className="text-slate-400 text-xs uppercase tracking-wider">{label}</span>
              <span className={`text-xs font-bold ${i === 5 ? "text-amber-400" : "text-white"}`}>{val}</span>
            </div>
          ))}

          <div className="mt-5 bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 flex items-center gap-3">
            <Ic d={I.check} size={16} stroke="#34d399" sw={2.5} />
            <p className="text-emerald-300 text-xs">{trade.message}</p>
          </div>

          <Button onClick={onClose} variant="primary" className="w-full mt-5">Close Receipt</Button>
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  const location = useLocation();
  const { user, refreshUser } = useAuth();

  const [tab,      setTab]      = useState("BUY");
  const [symbol,   setSymbol]   = useState(location.state?.symbol || "AAPL");
  const [qty,      setQty]      = useState(1);
  const [quote,    setQuote]    = useState(null);
  const [fetching, setFetching] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [receipt,  setReceipt]  = useState(null);
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    setFetching(true); setError("");
    api.get(`/stocks/${symbol}`)
      .then(({ data }) => setQuote(data.stock))
      .catch(() => setError("Could not fetch live price"))
      .finally(() => setFetching(false));
  }, [symbol]);

  useEffect(() => {
    api.get("/portfolio")
      .then(({ data }) => setHoldings(data.holdings || []))
      .catch(() => {});
  }, [receipt]);

  const price    = quote?.price || 0;
  const total    = (qty * price).toFixed(2);
  const holding  = holdings.find((h) => h.symbol === symbol);
  const canAfford = user?.virtualCash >= parseFloat(total);
  const canSell   = holding && holding.quantity >= qty;
  const up        = (quote?.change || 0) >= 0;

  const placeTrade = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = tab === "BUY" ? "/trades/buy" : "/trades/sell";
      const { data } = await api.post(endpoint, {
        symbol,
        quantity: qty,
        companyName: NAMES[symbol] || symbol,
      });
      await refreshUser();
      setReceipt({ ...data, type: tab, symbol, quantity: qty, price, total: parseFloat(total) });
    } catch (err) {
      setError(err.response?.data?.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Buy / Sell">
      {receipt && <ReceiptModal trade={receipt} onClose={() => setReceipt(null)} />}

      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        {/* Cash banner */}
        <div className="bg-slate-700/60 border border-amber-500/30 px-5 py-3 flex items-center justify-between">
          <span className="text-slate-400 text-xs tracking-widest uppercase font-semibold">Available Cash</span>
          <span className="text-amber-400 font-black text-xl" style={{ fontFamily: "Georgia,serif" }}>
            ${fmt$(user?.virtualCash || 0)}
          </span>
        </div>

        <Card>
          <CardHead icon={<Ic d={tab === "BUY" ? I.buy : I.sell} size={16} />} title="Place Order" />
          <div className="p-6 flex flex-col gap-5">
            {/* Tabs */}
            <div className="flex overflow-hidden border border-slate-500/40">
              {["BUY","SELL"].map((t) => (
                <button key={t} onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all
                    ${tab === t
                      ? t === "BUY" ? "bg-emerald-500 text-slate-900" : "bg-red-500 text-white"
                      : "bg-slate-600 text-slate-400 hover:text-white"}`}>
                  {t === "BUY" ? "▲ Buy" : "▼ Sell"}
                </button>
              ))}
            </div>

            {/* Stock selector */}
            <div>
              <label className="text-slate-400 text-xs tracking-widest uppercase font-semibold block mb-2">
                Stock Symbol
              </label>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-slate-600 border border-slate-500/50 text-white text-sm px-4 py-3 outline-none appearance-none cursor-pointer focus:border-amber-500 transition-colors">
                {SYMBOLS.map((s) => (
                  <option key={s} value={s}>{s} — {NAMES[s] || s}</option>
                ))}
              </select>
            </div>

            {/* Live quote */}
            <div className="bg-slate-600/50 border border-slate-500/30 px-5 py-4">
              {fetching ? (
                <div className="flex items-center gap-3">
                  <Spinner size="sm" />
                  <span className="text-slate-400 text-xs">Fetching live price…</span>
                </div>
              ) : quote ? (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Market Price</p>
                    <p className="text-amber-400 font-black text-3xl" style={{ fontFamily: "Georgia,serif" }}>
                      ${fmt$(quote.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
                      {up ? "▲" : "▼"} ${fmt$(Math.abs(quote.change))} ({Number(quote.changePct).toFixed(2)}%)
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      H: ${fmt$(quote.high)} · L: ${fmt$(quote.low)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sell — show holding */}
            {tab === "SELL" && (
              <div className="bg-slate-600/30 border border-slate-500/30 px-4 py-3 flex justify-between">
                <span className="text-slate-400 text-xs uppercase tracking-widest">You hold</span>
                <span className="text-white font-bold text-sm">
                  {holding ? `${holding.quantity} shares` : "0 shares"}
                </span>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-slate-400 text-xs tracking-widest uppercase font-semibold block mb-2">
                Quantity
              </label>
              <div className="flex items-center border border-slate-500/40 overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 bg-slate-600 text-white font-black text-xl hover:bg-slate-500 transition-colors shrink-0">−</button>
                <input type="number" value={qty} min="1"
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-slate-700 text-white text-center text-lg py-2 outline-none h-12 font-bold" />
                <button onClick={() => setQty((q) => q + 1)}
                  className="w-12 h-12 bg-slate-600 text-white font-black text-xl hover:bg-slate-500 transition-colors shrink-0">+</button>
              </div>
              {tab === "BUY" && (
                <p className="text-slate-500 text-xs mt-1.5">
                  Max you can afford:{" "}
                  <span className="text-amber-400 font-bold">
                    {price > 0 ? Math.floor((user?.virtualCash || 0) / price) : 0} shares
                  </span>
                </p>
              )}
            </div>

            {/* Total */}
            <div className={`px-5 py-4 border flex justify-between items-center
              ${!canAfford && tab === "BUY" ? "border-red-500/50 bg-red-500/10" : "border-slate-500/30 bg-slate-600/40"}`}>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest">Estimated Total</p>
                {tab === "BUY" && !canAfford && (
                  <p className="text-red-400 text-xs mt-0.5">⚠ Insufficient funds</p>
                )}
              </div>
              <p className="text-white font-black text-2xl" style={{ fontFamily: "Georgia,serif" }}>
                ${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <Alert type="error" message={error} onClose={() => setError("")} />

            <Button
              onClick={placeTrade}
              variant={tab === "BUY" ? "success" : "danger"}
              loading={loading}
              disabled={!quote || fetching || (tab === "BUY" && !canAfford) || (tab === "SELL" && !canSell)}
              className="w-full py-4 text-sm">
              {tab === "BUY"
                ? `▲ Buy ${qty} Share${qty > 1 ? "s" : ""} of ${symbol}`
                : `▼ Sell ${qty} Share${qty > 1 ? "s" : ""} of ${symbol}`}
            </Button>

            <p className="text-slate-500 text-xs text-center">
              {tab === "BUY"
                ? `$${fmt$(user?.virtualCash || 0)} available → $${fmt$(Math.max(0, (user?.virtualCash || 0) - parseFloat(total)))} after`
                : "Virtual trading only · No real money involved"}
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}