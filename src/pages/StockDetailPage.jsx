import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, CardHead, Spinner, Button, Modal, Input, Select, Ic, I, fmt$, useT, Badge } from "../components/UI";
import { useWatchlist } from "../context/WatchlistContext";
import { useAlerts } from "../context/AlertContext";
import api from "../utils/api";

const NAMES = { AAPL:"Apple Inc.",MSFT:"Microsoft Corp.",GOOGL:"Alphabet Inc.",AMZN:"Amazon.com",NVDA:"NVIDIA Corp.",META:"Meta Platforms",TSLA:"Tesla Inc.",JPM:"JPMorgan Chase","BRK.B":"Berkshire Hathaway",V:"Visa Inc." };

function genHistory(base, days) {
  let v = base;
  return Array.from({ length: days }, (_, i) => {
    v += (Math.random() - 0.47) * base * 0.022;
    v  = Math.max(base * 0.7, Math.min(base * 1.5, v));
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return { day: d.toLocaleDateString("en-US", { month:"short", day:"numeric" }), val: +v.toFixed(2) };
  });
}

function FullChart({ data, color }) {
  const W = 800, H = 200, PAD = 16;
  if (!data.length) return null;
  const vals  = data.map((d) => d.val);
  const min   = Math.min(...vals);
  const max   = Math.max(...vals);
  const range = max - min || 1;
  const pts   = vals.map((v, i) => [
    (i / (vals.length - 1)) * W,
    PAD + (1 - (v - min) / range) * (H - PAD * 2),
  ]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cg)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="5"
        fill={color} stroke="#1e293b" strokeWidth="2.5" />
      {[0, 0.5, 1].map((f, i) => {
        const v = min + (max - min) * (1 - f);
        const y = PAD + f * (H - PAD * 2);
        return (
          <text key={i} x={W - 4} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
            ${fmt$(v)}
          </text>
        );
      })}
    </svg>
  );
}

export default function StockDetailPage() {
  const { symbol } = useParams();
  const navigate   = useNavigate();
  const t          = useT();
  const { toggle, has } = useWatchlist();
  const { addAlert }    = useAlerts();

  const [quote,       setQuote]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [range,       setRange]       = useState("1M");
  const [history,     setHistory]     = useState({});
  const [alertModal,  setAlertModal]  = useState(false);
  const [alertTarget, setAlertTarget] = useState("");
  const [alertCond,   setAlertCond]   = useState("above");

  const RANGES = { "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365 };

  useEffect(() => {
    setLoading(true);
    api.get(`/stocks/${symbol}`)
      .then(({ data }) => {
        setQuote(data.stock);
        const h = {};
        Object.entries(RANGES).forEach(([r, days]) => {
          h[r] = genHistory(data.stock.price, days);
        });
        setHistory(h);
      })
      .catch(() => navigate("/stocks"))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) return (
    <Layout title={symbol}>
      <div className="flex justify-center py-40"><Spinner size="lg" /></div>
    </Layout>
  );
  if (!quote) return null;

  const up       = quote.change >= 0;
  const col      = up ? "#34d399" : "#f87171";
  const chartData = history[range] || [];
  const inWl     = has(symbol);

  const stats = [
    ["Open",         `$${fmt$(quote.open)}`],
    ["High",         `$${fmt$(quote.high)}`],
    ["Low",          `$${fmt$(quote.low)}`],
    ["Prev Close",   `$${fmt$(quote.prevClose)}`],
    ["Volume",       quote.volume?.toLocaleString?.() || "—"],
    ["Last Trade",   quote.latestTradingDay || "—"],
  ];

  return (
    <Layout title={`${symbol} — ${NAMES[symbol] || symbol}`}>

      <Modal open={alertModal} onClose={() => setAlertModal(false)} title={`Alert for ${symbol}`}>
        <div className="flex flex-col gap-4">
          <div className={`${t.dark ? "bg-slate-700/50" : "bg-slate-50"} rounded-xl p-3 flex items-center justify-between`}>
            <span className={t.muted}>Current Price</span>
            <span className={`${t.text} font-bold text-lg`}>${fmt$(quote.price)}</span>
          </div>
          <Select label="Condition" value={alertCond} onChange={(e) => setAlertCond(e.target.value)}>
            <option value="above">Alert when price goes ABOVE</option>
            <option value="below">Alert when price goes BELOW</option>
          </Select>
          <Input label="Target Price ($)" type="number" step="0.01"
            placeholder={`e.g. ${(quote.price * 1.05).toFixed(2)}`}
            value={alertTarget} onChange={(e) => setAlertTarget(e.target.value)} />
          <Button onClick={() => {
            if (!alertTarget) return;
            addAlert(symbol, alertTarget, alertCond);
            setAlertModal(false);
            setAlertTarget("");
          }} variant="primary" className="w-full">
            <Ic d={I.bell} size={15} /> Set Alert
          </Button>
        </div>
      </Modal>

      <div className="flex flex-col gap-5">

        {/* Hero card */}
        <Card className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <span className="text-amber-500 font-bold text-2xl">{symbol[0]}</span>
              </div>
              <div>
                <h2 className={`${t.text} font-bold text-2xl`}>{symbol}</h2>
                <p className={`${t.muted} text-sm`}>{NAMES[symbol] || symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`${t.text} font-bold text-3xl`}>${fmt$(quote.price)}</p>
              <p className={`font-semibold mt-0.5 ${up ? "text-emerald-400" : "text-red-400"}`}>
                {up ? "▲" : "▼"} ${fmt$(Math.abs(quote.change))} ({Number(quote.changePct).toFixed(2)}%)
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={() => navigate("/trade", { state: { symbol } })} variant="success" size="sm">
              <Ic d={I.buy} size={14} /> Buy
            </Button>
            <Button onClick={() => navigate("/trade", { state: { symbol, tab: "SELL" } })} variant="danger" size="sm">
              <Ic d={I.sell} size={14} /> Sell
            </Button>
            <Button onClick={() => toggle(symbol)} variant={inWl ? "ghost" : "outline"} size="sm">
              <Ic d={I.star} size={14}
                fill={inWl ? "#f59e0b" : "none"}
                stroke={inWl ? "#f59e0b" : "currentColor"} />
              {inWl ? "Watchlisted" : "Watchlist"}
            </Button>
            <Button onClick={() => setAlertModal(true)} variant="ghost" size="sm">
              <Ic d={I.bell} size={14} /> Alert
            </Button>
          </div>

          {/* Range selector */}
          <div className="flex gap-1 mb-4">
            {Object.keys(RANGES).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${range === r ? "bg-amber-500 text-slate-900" : `${t.muted} ${t.hover}`}`}>
                {r}
              </button>
            ))}
          </div>

          <FullChart data={chartData} color={col} />

          <div className="flex justify-between mt-3">
            {chartData
              .filter((_, i) => i % Math.ceil(chartData.length / 5) === 0)
              .map((d, i) => (
                <span key={i} className={`${t.subtle} text-xs`}>{d.day}</span>
              ))}
          </div>
        </Card>

        {/* Stats grid */}
        <Card>
          <CardHead icon={<Ic d={I.chart} size={16} />} title="Key Statistics" />
          <div className="grid grid-cols-2 md:grid-cols-3">
            {stats.map(([label, val], i) => (
              <div key={i} className={`px-5 py-4 border-b ${t.divider} ${i % 2 !== 0 ? `border-l ${t.divider}` : ""}`}>
                <p className={`${t.muted} text-xs mb-1`}>{label}</p>
                <p className={`${t.text} font-semibold`}>{val}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 52-week range */}
        <Card className="p-5">
          <p className={`${t.muted} text-xs font-semibold uppercase tracking-wider mb-4`}>
            52-Week Range (Simulated)
          </p>
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-sm font-semibold">${fmt$(quote.price * 0.72)}</span>
            <div className={`flex-1 h-2 ${t.dark ? "bg-slate-700" : "bg-slate-200"} rounded-full overflow-hidden`}>
              <div className="h-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400 rounded-full"
                style={{ width: `${Math.min(85, Math.max(15, 40 + (parseFloat(quote.changePct) || 0) * 5))}%` }} />
            </div>
            <span className="text-emerald-400 text-sm font-semibold">${fmt$(quote.price * 1.38)}</span>
          </div>
          <div className="flex justify-center mt-3">
            <Badge color={up ? "green" : "red"}>Current: ${fmt$(quote.price)}</Badge>
          </div>
        </Card>

      </div>
    </Layout>
  );
}