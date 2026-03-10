import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, StatCard, Spinner, Button, Ic, I, fmt$ } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function PortfolioPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [trades,  setTrades]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("holdings");

  useEffect(() => {
    Promise.all([api.get("/portfolio"), api.get("/trades?limit=50")])
      .then(([p, t]) => { setData(p.data); setTrades(t.data.trades || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Portfolio & Wallet">
      <div className="flex justify-center py-40"><Spinner size="lg" /></div>
    </Layout>
  );

  const s        = data?.summary || {};
  const holdings = data?.holdings || [];

  return (
    <Layout title="Portfolio & Wallet">
      <div className="flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Portfolio"
            value={`$${(s.totalPortfolioValue||0).toLocaleString(undefined,{maximumFractionDigits:0})}`}
            icon={I.portf} accent="bg-amber-500" />
          <StatCard label="Invested"
            value={`$${fmt$(s.totalInvested||0)}`}
            icon={I.stocks} accent="bg-blue-500" />
          <StatCard label="Cash Balance"
            value={`$${fmt$(s.cashBalance||user?.virtualCash||0)}`}
            icon={I.wallet} accent="bg-purple-500" />
          <StatCard label="Unrealized P&L"
            value={`${(s.totalPnl||0)>=0?"+":""}$${fmt$(s.totalPnl||0)}`}
            sub={`${s.pnlPct||0}%`} up={(s.totalPnl||0)>=0}
            icon={I.trend} accent={(s.totalPnl||0)>=0?"bg-emerald-500":"bg-red-500"} />
        </div>

        {/* Wallet card */}
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold mb-1">
                Virtual Wallet Balance
              </p>
              <p className="text-white text-4xl font-black" style={{ fontFamily: "Georgia,serif" }}>
                ${fmt$(s.cashBalance || user?.virtualCash || 0)}
              </p>
              <p className="text-slate-400 text-xs mt-1">Started with $100,000.00</p>
            </div>
            <Button onClick={() => navigate("/trade")} variant="primary" className="px-6 py-3">
              <Ic d={I.buy} size={14} /> Place New Trade
            </Button>
          </div>
          {s.totalPortfolioValue > 0 && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Cash {(((s.cashBalance||0)/s.totalPortfolioValue)*100).toFixed(1)}%</span>
                <span>Invested {(((s.totalInvested||0)/s.totalPortfolioValue)*100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-600 w-full flex overflow-hidden">
                <div className="h-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100,((s.cashBalance||0)/s.totalPortfolioValue)*100)}%` }} />
                <div className="h-full bg-blue-500 flex-1" />
              </div>
            </div>
          )}
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-600/50">
          {[["holdings","Holdings"], ["history","Trade History"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-xs font-black tracking-widest uppercase border-b-2 -mb-px transition-all
                ${tab === key ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "holdings" && (
          holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-slate-400">You have no open positions.</p>
              <Button onClick={() => navigate("/trade")} variant="primary">Start Trading →</Button>
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-500/40">
                      {["Stock","Company","Qty","Avg Buy","Current","Value","P&L","P&L %","Action"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-600/30">
                    {holdings.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-600/20 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-600 flex items-center justify-center">
                              <span className="text-amber-400 font-black text-sm">{h.symbol[0]}</span>
                            </div>
                            <span className="text-white font-black">{h.symbol}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300">{h.companyName}</td>
                        <td className="px-4 py-4 text-white font-bold">{h.quantity}</td>
                        <td className="px-4 py-4 text-slate-300">${fmt$(h.avgBuyPrice)}</td>
                        <td className="px-4 py-4 text-white font-bold">${fmt$(h.currentPrice)}</td>
                        <td className="px-4 py-4 text-white font-bold">${fmt$(h.currentValue)}</td>
                        <td className={`px-4 py-4 font-bold ${h.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {h.unrealizedPnl >= 0 ? "+" : ""}${fmt$(h.unrealizedPnl)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 font-bold ${h.pnlPct >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                            {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => navigate("/trade", { state: { symbol: h.symbol, tab: "SELL" } })}
                            className="px-2.5 py-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-black tracking-widest uppercase transition-all">
                            Sell
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        )}

        {tab === "history" && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-500/40">
                    {["Date","Stock","Type","Qty","Price","Total","Cash After"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600/30">
                  {trades.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-600/20 transition-colors">
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                      </td>
                      <td className="px-4 py-3 text-white font-bold">{t.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-black ${t.type === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{t.quantity}</td>
                      <td className="px-4 py-3 text-slate-300">${fmt$(t.price)}</td>
                      <td className="px-4 py-3 text-white font-bold">${fmt$(t.total)}</td>
                      <td className="px-4 py-3 text-amber-400 font-semibold">${fmt$(t.cashAfter)}</td>
                    </tr>
                  ))}
                  {trades.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No trades yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}