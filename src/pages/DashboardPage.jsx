import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, CardHead, StatCard, Spinner, Ic, I, fmt$ } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

function genHistory(start) {
  let val = start || 100000;
  return Array.from({ length: 31 }, (_, i) => {
    val += (Math.random() - 0.42) * 900;
    const d = new Date(); d.setDate(d.getDate() - (30 - i));
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      val: Math.max(80000, +val.toFixed(0)),
    };
  });
}

function PortfolioChart({ data }) {
  const W = 700, H = 150;
  const vals = data.map((d) => d.val);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const pts = vals.map((v, i) => [
    (i / (vals.length - 1)) * W,
    H - ((v - min) / range) * (H - 20) - 10,
  ]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const pct  = ((vals.at(-1) - vals[0]) / vals[0] * 100).toFixed(2);
  const up   = pct >= 0;
  const col  = up ? "#34d399" : "#f87171";

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold">Portfolio (30‑day)</p>
          <p className="text-white text-3xl font-black mt-1" style={{ fontFamily: "Georgia,serif" }}>
            ${vals.at(-1).toLocaleString()}
          </p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-bold ${up ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
          {up ? "▲" : "▼"} {Math.abs(pct)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 130 }}>
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity="0.3" />
            <stop offset="100%" stopColor={col} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#pg)" />
        <path d={line} fill="none" stroke={col} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="5" fill={col} stroke="#334155" strokeWidth="2.5" />
      </svg>
      <div className="flex justify-between mt-2">
        {data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map((d, i) => (
          <span key={i} className="text-slate-500 text-xs">{d.day}</span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [trades,    setTrades]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [history]   = useState(() => genHistory(user?.virtualCash));

  useEffect(() => {
    Promise.all([api.get("/portfolio"), api.get("/trades?limit=5")])
      .then(([p, t]) => { setPortfolio(p.data); setTrades(t.data.trades || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Dashboard">
      <div className="flex items-center justify-center py-40 gap-4">
        <Spinner size="lg" />
        <span className="text-slate-400">Loading your dashboard…</span>
      </div>
    </Layout>
  );

  const summary = portfolio?.summary || {};

  return (
    <Layout title="Dashboard">
      <div className="flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Portfolio Value"
            value={`$${(summary.totalPortfolioValue || user?.virtualCash || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            sub="All time" icon={I.portf} accent="bg-amber-500" />
          <StatCard label="Unrealized P&L"
            value={`${(summary.totalPnl || 0) >= 0 ? "+" : ""}$${fmt$(summary.totalPnl || 0)}`}
            sub={`${summary.pnlPct || 0}%`} up={(summary.totalPnl || 0) >= 0}
            icon={I.trend} accent={(summary.totalPnl || 0) >= 0 ? "bg-emerald-500" : "bg-red-500"} />
          <StatCard label="Cash Balance"
            value={`$${fmt$(summary.cashBalance || user?.virtualCash || 0)}`}
            sub="Available" icon={I.wallet} accent="bg-blue-500" />
          <StatCard label="Open Positions"
            value={portfolio?.holdings?.length || 0}
            sub="Stocks held" icon={I.stocks} accent="bg-purple-500" />
        </div>

        {/* Chart + recent trades */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 p-5">
            <PortfolioChart data={history} />
          </Card>
          <Card>
            <CardHead icon={<Ic d={I.history} size={16} />} title="Recent Trades" />
            {trades.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No trades yet.
                <button onClick={() => navigate("/trade")}
                  className="text-amber-400 hover:underline mt-1 block mx-auto">
                  Place your first trade →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-600/40">
                {trades.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <span className={`px-1.5 py-0.5 text-xs font-black ${t.type === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {t.type}
                    </span>
                    <span className="text-white text-xs font-bold">{t.symbol}</span>
                    <span className="text-slate-400 text-xs">{t.quantity}×</span>
                    <span className="ml-auto text-white text-xs font-bold">${fmt$(t.total)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 border-t border-slate-600/40">
              <button onClick={() => navigate("/portfolio")}
                className="w-full text-center text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors">
                View full portfolio →
              </button>
            </div>
          </Card>
        </div>

        {/* Holdings table */}
        {portfolio?.holdings?.length > 0 && (
          <Card>
            <CardHead icon={<Ic d={I.portf} size={16} />} title="Holdings Snapshot" />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-500/40">
                    {["Stock","Qty","Avg Buy","Current","Value","P&L"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold tracking-widest uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600/30">
                  {portfolio.holdings.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-600/20 transition-colors">
                      <td className="px-4 py-3 text-white font-bold">{h.symbol}</td>
                      <td className="px-4 py-3 text-slate-300">{h.quantity}</td>
                      <td className="px-4 py-3 text-slate-300">${fmt$(h.avgBuyPrice)}</td>
                      <td className="px-4 py-3 text-white">${fmt$(h.currentPrice)}</td>
                      <td className="px-4 py-3 text-white font-bold">${fmt$(h.currentValue)}</td>
                      <td className={`px-4 py-3 font-bold ${h.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {h.unrealizedPnl >= 0 ? "+" : ""}${fmt$(h.unrealizedPnl)} ({h.pnlPct}%)
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