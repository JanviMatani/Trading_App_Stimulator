import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, CardHead, Spinner, Button, AlertBanner, Ic, I, fmt$, useT, Badge } from "../components/UI";
import PaymentModal from "../components/PaymentModal";
import { useAuth } from "../context/AuthContext";
import { useAlerts } from "../context/AlertContext";
import api from "../utils/api";

const SYMBOLS = ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","JPM","V","BRK.B"];
const NAMES = { AAPL:"Apple Inc.",MSFT:"Microsoft",GOOGL:"Alphabet",AMZN:"Amazon",NVDA:"NVIDIA",META:"Meta",TSLA:"Tesla",JPM:"JPMorgan","BRK.B":"Berkshire",V:"Visa" };

function ReceiptModal({ trade, onClose }) {
  const t = useT();
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${t.card} border ${t.border} w-full max-w-sm rounded-2xl shadow-2xl`}
        style={{ animation: "fadeUp .3s ease both" }}>
        <div className={`h-1 w-full rounded-t-2xl ${trade.type === "BUY" ? "bg-emerald-500" : "bg-red-500"}`} />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
              ${trade.type === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              <Ic d={trade.type === "BUY" ? I.buy : I.sell} size={22} />
            </div>
            <div>
              <p className={`${t.text} font-bold text-lg`}>Order Executed</p>
              <Badge color={trade.type === "BUY" ? "green" : "red"}>{trade.type} CONFIRMED</Badge>
            </div>
          </div>
          <div className={`${t.dark ? "bg-slate-700/50" : "bg-slate-50"} rounded-xl p-4 mb-4 flex flex-col gap-3`}>
            {[
              ["Stock",       trade.symbol],
              ["Quantity",    `${trade.quantity} shares`],
              ["Price/Share", `$${fmt$(trade.price)}`],
              ["Total",       `$${fmt$(trade.total)}`],
              ["New Balance", `$${fmt$(trade.newCashBalance)}`],
            ].map(([label, val], i) => (
              <div key={i} className="flex justify-between items-center">
                <span className={`${t.muted} text-xs`}>{label}</span>
                <span className={`text-sm font-semibold ${i === 4 ? "text-amber-500" : t.text}`}>{val}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-5">
            <Ic d={I.check} size={15} stroke="#34d399" sw={2.5} />
            <p className="text-emerald-400 text-xs font-medium">{trade.message}</p>
          </div>
          <Button onClick={onClose} variant="primary" className="w-full" size="lg">Close Receipt</Button>
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const { addToast } = useAlerts();
  const t = useT();

  const [tab,      setTab]      = useState(location.state?.tab || "BUY");
  const [symbol,   setSymbol]   = useState(location.state?.symbol || "AAPL");
  const [qty,      setQty]      = useState(1);
  const [quote,    setQuote]    = useState(null);
  const [fetching, setFetching] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [receipt,  setReceipt]  = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [showPay,  setShowPay]  = useState(false);

  useEffect(() => {
    setFetching(true);
    setError("");
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

  const price     = quote?.price || 0;
  const total     = parseFloat((qty * price).toFixed(2));
  const holding   = holdings.find((h) => h.symbol === symbol);
  const canAfford = (user?.virtualCash || 0) >= total;
  const canSell   = holding && holding.quantity >= qty;
  const up        = (quote?.change || 0) >= 0;

  const executeTrade = async () => {
    setError("");
    setLoading(true);
    try {
      const endpoint = tab === "BUY" ? "/trades/buy" : "/trades/sell";
      const { data } = await api.post(endpoint, {
        symbol,
        quantity: qty,
        companyName: NAMES[symbol] || symbol,
      });
      await refreshUser();
      setReceipt({ ...data, type: tab, symbol, quantity: qty, price, total });
    } catch (err) {
      setError(err.response?.data?.message || "Trade failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = () => {
    if (tab === "BUY") {
      setShowPay(true);
    } else {
      executeTrade();
    }
  };

  return (
    <Layout title="Buy / Sell">
      {receipt && <ReceiptModal trade={receipt} onClose={() => setReceipt(null)} />}
      <PaymentModal
        open={showPay}
        onClose={() => setShowPay(false)}
        onSuccess={() => { setShowPay(false); executeTrade(); }}
        amount={total}
        symbol={symbol}
        quantity={qty}
        price={price}
        type="BUY"
      />

      <div className="max-w-xl mx-auto flex flex-col gap-5">
        {/* Balance banner */}
        <div className={`${t.dark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"} border rounded-2xl px-5 py-4 flex items-center justify-between`}>
          <div>
            <p className={`${t.muted} text-xs font-medium`}>Available Cash</p>
            <p className="text-amber-500 font-bold text-2xl">
              ${Number(user?.virtualCash || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
            <Ic d={I.wallet} size={22} stroke="#f59e0b" sw={1.8} />
          </div>
        </div>

        <Card>
          <CardHead icon={<Ic d={tab === "BUY" ? I.buy : I.sell} size={16} />} title="Place Order" />
          <div className="p-5 flex flex-col gap-4">

            {/* BUY / SELL toggle */}
            <div className={`flex ${t.dark ? "bg-slate-900/60" : "bg-slate-100"} rounded-xl p-1`}>
              {["BUY", "SELL"].map((tp) => (
                <button key={tp} onClick={() => { setTab(tp); setError(""); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all
                    ${tab === tp
                      ? tp === "BUY"
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-red-500 text-white shadow-lg shadow-red-500/25"
                      : `${t.muted}`}`}>
                  {tp === "BUY" ? "▲ Buy" : "▼ Sell"}
                </button>
              ))}
            </div>

            {/* Stock selector */}
            <div>
              <label className={`${t.muted} text-xs font-semibold uppercase tracking-wider block mb-2`}>
                Select Stock
              </label>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}
                className={`w-full border rounded-xl text-sm px-4 py-3 outline-none appearance-none transition-colors ${t.input}`}>
                {SYMBOLS.map((s) => (
                  <option key={s} value={s}>{s} — {NAMES[s]}</option>
                ))}
              </select>
            </div>

            {/* Live price */}
            <div className={`${t.dark ? "bg-slate-900/60" : "bg-slate-50"} border ${t.border} rounded-xl px-5 py-4`}>
              {fetching ? (
                <div className="flex items-center gap-3">
                  <Spinner size="sm" />
                  <span className={`${t.muted} text-sm`}>Fetching live price…</span>
                </div>
              ) : quote ? (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className={`${t.muted} text-xs mb-1`}>Market Price</p>
                    <p className="text-amber-500 font-bold text-3xl">${fmt$(quote.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
                      {up ? "▲" : "▼"} ${fmt$(Math.abs(quote.change))} ({Number(quote.changePct).toFixed(2)}%)
                    </p>
                    <p className={`${t.subtle} text-xs mt-0.5`}>
                      H: ${fmt$(quote.high)} · L: ${fmt$(quote.low)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className={`${t.muted} text-sm`}>Price unavailable</p>
              )}
            </div>

            {/* Holdings info when selling */}
            {tab === "SELL" && (
              <div className={`${t.dark ? "bg-slate-900/60" : "bg-slate-50"} border ${t.border} rounded-xl px-4 py-3 flex justify-between items-center`}>
                <span className={`${t.muted} text-sm`}>You currently hold</span>
                <span className={`${t.text} font-bold`}>
                  {holding ? `${holding.quantity} shares` : "0 shares"}
                </span>
              </div>
            )}

            {/* Quantity stepper */}
            <div>
              <label className={`${t.muted} text-xs font-semibold uppercase tracking-wider block mb-2`}>
                Quantity
              </label>
              <div className={`flex items-center border ${t.border} rounded-xl overflow-hidden`}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className={`w-12 h-12 ${t.dark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200"} ${t.text} text-xl font-bold transition-colors shrink-0`}>
                  −
                </button>
                <input type="number" value={qty} min="1"
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`flex-1 ${t.dark ? "bg-slate-800" : "bg-white"} ${t.text} text-center text-lg font-bold h-12 outline-none`} />
                <button onClick={() => setQty((q) => q + 1)}
                  className={`w-12 h-12 ${t.dark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200"} ${t.text} text-xl font-bold transition-colors shrink-0`}>
                  +
                </button>
              </div>
              {tab === "BUY" && price > 0 && (
                <p className={`${t.subtle} text-xs mt-2`}>
                  Max affordable:{" "}
                  <span className="text-amber-500 font-semibold">
                    {Math.floor((user?.virtualCash || 0) / price)} shares
                  </span>
                </p>
              )}
            </div>

            {/* Total */}
            <div className={`rounded-xl border px-5 py-4 flex justify-between items-center
              ${!canAfford && tab === "BUY"
                ? "border-red-500/40 bg-red-500/5"
                : `${t.border} ${t.dark ? "bg-slate-900/40" : "bg-slate-50"}`}`}>
              <div>
                <p className={`${t.muted} text-xs`}>Estimated Total</p>
                {tab === "BUY" && !canAfford && (
                  <p className="text-red-400 text-xs mt-0.5">⚠ Insufficient funds</p>
                )}
              </div>
              <p className={`${t.text} font-bold text-2xl`}>${fmt$(total)}</p>
            </div>

            <AlertBanner type="error" message={error} onClose={() => setError("")} />

            <Button
              onClick={handleBuyClick}
              variant={tab === "BUY" ? "success" : "danger"}
              loading={loading}
              disabled={!quote || fetching || (tab === "BUY" && !canAfford) || (tab === "SELL" && !canSell)}
              className="w-full"
              size="lg">
              {tab === "BUY"
                ? <><Ic d={I.credit} size={18} /> Pay & Buy {qty} Share{qty > 1 ? "s" : ""} of {symbol}</>
                : <><Ic d={I.sell} size={18} /> Sell {qty} Share{qty > 1 ? "s" : ""} of {symbol}</>}
            </Button>

            {tab === "BUY" && (
              <p className={`${t.subtle} text-xs text-center`}>
                Clicking "Pay & Buy" opens the mock payment gateway — no real money charged
              </p>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}