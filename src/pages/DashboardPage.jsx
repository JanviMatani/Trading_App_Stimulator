import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, CardHead, Spinner, Ic, I, fmt$, useT, Badge } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

function genHistory(start) {
  let val = start || 100000;
  return Array.from({ length: 31 }, (_, i) => {
    val += (Math.random() - 0.45) * 2500;
    val = Math.max(75000, Math.min(150000, val));
    const d = new Date();
    d.setDate(d.getDate() - (30 - i));
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      val: +val.toFixed(0),
    };
  });
}

function MiniSparkline({ up }) {
  const points = Array.from({ length: 12 }, (_, i) => {
    const x = (i / 11) * 100;
    const base = 50;
    const y = base + (Math.random() - (up ? 0.35 : 0.65)) * 30;
    return `${x.toFixed(1)},${Math.max(5, Math.min(95, y)).toFixed(1)}`;
  });
  const col = up ? "#34d399" : "#f87171";
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <polyline points={points.join(" ")} fill="none" stroke={col}
        strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const COLOR_MAP = {
  "bg-amber-500":   { bg: "rgba(245,158,11,0.12)",  text: "#f59e0b" },
  "bg-emerald-500": { bg: "rgba(52,211,153,0.12)",  text: "#34d399" },
  "bg-red-500":     { bg: "rgba(248,113,113,0.12)", text: "#f87171" },
  "bg-blue-500":    { bg: "rgba(59,130,246,0.12)",  text: "#3b82f6" },
  "bg-purple-500":  { bg: "rgba(168,85,247,0.12)",  text: "#a855f7" },
};

function StatCard({ label, value, sub, up, icon, color }) {
  const t = useT();
  const c = COLOR_MAP[color] || COLOR_MAP["bg-amber-500"];

  return (
    <Card className="p-5 overflow-hidden relative">
      {/* Background mini chart */}
      <div className="absolute right-0 bottom-0 w-24 h-16 opacity-20 pointer-events-none">
        <MiniSparkline up={up !== false} />
      </div>

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: c.bg }}>
          <span style={{ color: c.text }}>
            <Ic d={icon} size={20} />
          </span>
        </div>
        {sub !== undefined && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
            ${up === true  ? "bg-emerald-500/15 text-emerald-400" :
              up === false ? "bg-red-500/15 text-red-400" :
                             `${t.dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}`}>
            {sub}
          </span>
        )}
      </div>
      <p className={`${t.muted} text-xs font-medium mb-1 relative z-10`}>{label}</p>
      <p className={`${t.text} text-xl font-bold relative z-10`}>{value}</p>
    </Card>
  );
}

function PortfolioChart({ data }) {
  const t  = useT();
  const W  = 800, H = 180, PAD = 16;
  const vals  = data.map((d) => d.val);
  const min   = Math.min(...vals);
  const max   = Math.max(...vals);
  const range = max - min || 1;

  const pts = vals.map((v, i) => [
    (i / (vals.length - 1)) * W,
    PAD + (1 - (v - min) / range) * (H - PAD * 2),
  ]);

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  const pct = (((vals.at(-1) - vals[0]) / vals[0]) * 100).toFixed(2);
  const up  = parseFloat(pct) >= 0;
  const col = up ? "#34d399" : "#f87171";

  const fmtUSD = (n) =>
    Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className={`${t.muted} text-xs font-medium mb-1`}>Portfolio Value (30-day simulation)</p>
          <p className={`${t.text} font-bold text-3xl`}>${fmtUSD(vals.at(-1))}</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-semibold rounded-xl
          ${up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
          {up ? "▲" : "▼"} {Math.abs(pct)}%
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 150 }}>
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={col} stopOpacity="0.35" />
            <stop offset="100%" stopColor={col} stopOpacity="0"    />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#pg)" />
        <path d={line} fill="none" stroke={col} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="5"
          fill={col} stroke={t.dark ? "#1e293b" : "#f8fafc"} strokeWidth="3" />
      </svg>

      <div className="flex justify-between mt-3">
        {data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map((d, i) => (
          <span key={i} className={`${t.subtle} text-xs`}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const t         = useT();
  const [portfolio, setPortfolio] = useState(null);
  const [trades,    setTrades]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [history]   = useState(() => genHistory(user?.virtualCash));

  useEffect(() => {
    Promise.all([api.get("/portfolio"), api.get("/trades?limit=5")])
      .then(([p, tr]) => {
        setPortfolio(p.data);
        setTrades(tr.data.trades || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Dashboard">
      <div className="flex items-center justify-center py-40 gap-4">
        <Spinner size="lg" />
        <span className={t.muted}>Loading your dashboard…</span>
      </div>
    </Layout>
  );

  const s = portfolio?.summary || {};

  // Always use en-US locale to avoid Indian number formatting
  const fmtUSD = (n) =>
    Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <Layout title="Dashboard">
      <div className="flex flex-col gap-5">

        {/* Stat cards - NO straight accent lines, use background sparklines instead */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Portfolio Value"
            value={`$${fmtUSD(s.totalPortfolioValue || user?.virtualCash || 0)}`}
            sub="All time"
            up={true}
            icon={I.portf}
            color="bg-amber-500"
          />
          <StatCard
            label="Unrealized P&L"
            value={`${(s.totalPnl || 0) >= 0 ? "+" : ""}$${fmt$(s.totalPnl || 0)}`}
            sub={`${s.pnlPct || 0}%`}
            up={(s.totalPnl || 0) >= 0}
            icon={I.trend}
            color={(s.totalPnl || 0) >= 0 ? "bg-emerald-500" : "bg-red-500"}
          />
          <StatCard
            label="Cash Balance"
            value={`$${fmtUSD(s.cashBalance || user?.virtualCash || 0)}`}
            sub="Available"
            up={true}
            icon={I.wallet}
            color="bg-blue-500"
          />
          <StatCard
            label="Open Positions"
            value={portfolio?.holdings?.length || 0}
            sub="Stocks held"
            icon={I.stocks}
            color="bg-purple-500"
          />
        </div>

        {/* Chart + Recent Trades */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 p-5">
            <PortfolioChart data={history} />
          </Card>

          <Card>
            <CardHead icon={<Ic d={I.history} size={16} />} title="Recent Trades" />
            {trades.length === 0 ? (
              <div className="p-8 text-center">
                <p className={`${t.muted} text-sm mb-3`}>No trades yet.</p>
                <button onClick={() => navigate("/trade")}
                  className="text-amber-500 hover:text-amber-400 text-sm font-semibold transition-colors">
                  Place your first trade →
                </button>
              </div>
            ) : (
              <div className={`divide-y ${t.divider}`}>
                {trades.map((tr, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 ${t.tableRow} transition-colors`}>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full
                      ${tr.type === "BUY" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                      {tr.type}
                    </span>
                    <span className={`${t.text} text-sm font-bold`}>{tr.symbol}</span>
                    <span className={`${t.muted} text-xs`}>{tr.quantity}×</span>
                    <span className={`ml-auto ${t.text} text-sm font-bold`}>${fmt$(tr.total)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className={`p-3 border-t ${t.divider}`}>
              <button onClick={() => navigate("/portfolio")}
                className="w-full text-center text-amber-500 hover:text-amber-400 text-xs font-semibold transition-colors">
                View full portfolio →
              </button>
            </div>
          </Card>
        </div>

        {/* Holdings snapshot */}
        {portfolio?.holdings?.length > 0 && (
          <Card>
            <CardHead icon={<Ic d={I.portf} size={16} />} title="Holdings Snapshot" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${t.divider}`}>
                    {["Stock","Qty","Avg Buy","Current","Value","P&L"].map((h) => (
                      <th key={h} className={`px-4 py-3 text-left ${t.muted} text-xs font-semibold uppercase tracking-wide`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.divider}`}>
                  {portfolio.holdings.map((h, i) => (
                    <tr key={i} className={`${t.tableRow} transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <span className="text-amber-500 font-bold text-xs">{h.symbol[0]}</span>
                          </div>
                          <span className={`${t.text} font-bold`}>{h.symbol}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${t.muted}`}>{h.quantity}</td>
                      <td className={`px-4 py-3 ${t.muted}`}>${fmt$(h.avgBuyPrice)}</td>
                      <td className={`px-4 py-3 ${t.text} font-semibold`}>${fmt$(h.currentPrice)}</td>
                      <td className={`px-4 py-3 ${t.text} font-bold`}>${fmt$(h.currentValue)}</td>
                      <td className={`px-4 py-3 font-bold ${h.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {h.unrealizedPnl >= 0 ? "+" : ""}${fmt$(h.unrealizedPnl)}
                        <span className="text-xs ml-1 opacity-75">({h.pnlPct}%)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>
    </Layout>
  );
}