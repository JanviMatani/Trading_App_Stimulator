import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card, CardHead, Spinner, Ic, I, fmt$, useT, Badge } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const MEDALS  = ["🥇","🥈","🥉"];
const RANGES = [["today","Today"], ["week","This Week"], ["month","This Month"], ["all","All Time"]];
const NAMES   = {
  AAPL:"Apple Inc.", MSFT:"Microsoft", GOOGL:"Alphabet", AMZN:"Amazon",
  NVDA:"NVIDIA", META:"Meta", TSLA:"Tesla", JPM:"JPMorgan",
  "BRK.B":"Berkshire", V:"Visa",
};

// ─── Stock Leaderboard ────────────────────────────────────────────
function StockLeaderboard() {
  const t = useT();
  const [stocks,  setStocks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [range,   setRange]   = useState("today");

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard/stocks?range=${range}`)
      .then(({ data }) => setStocks(data.stocks || []))
      .catch(() => setStocks([]))
      .finally(() => setLoading(false));
  }, [range]);

  const top3 = stocks.slice(0, 3);

  return (
    <div className="flex flex-col gap-5">

      {/* Range selector */}
      <div className="flex gap-2">
        {RANGES.map(([val, label]) => (
          <button key={val} onClick={() => setRange(val)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all
              ${range === val
                ? "bg-amber-500 text-slate-900"
                : `${t.muted} ${t.hover} border ${t.border}`}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Spinner size="lg" /></div>
      ) : stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Ic d={I.stocks} size={28} stroke="#f59e0b" />
          </div>
          <p className={`${t.text} font-semibold`}>No trades recorded yet</p>
          <p className={`${t.muted} text-sm`}>Start trading to see stocks appear here!</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length >= 1 && (
            <div className={`grid gap-4 ${top3.length === 3 ? "grid-cols-3" : top3.length === 2 ? "grid-cols-2" : "grid-cols-1 max-w-xs mx-auto"}`}>
              {(top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3).map((s, i) => {
                const actualRank = top3.length === 3
                  ? (i === 0 ? 2 : i === 1 ? 1 : 3)
                  : s.rank;
                const isFirst = actualRank === 1;
                const accentColor =
                  actualRank === 1 ? "border-yellow-500/50 shadow-yellow-500/10" :
                  actualRank === 2 ? "border-slate-400/30" :
                                     "border-amber-700/30";
                const barColor =
                  actualRank === 1 ? "bg-yellow-400" :
                  actualRank === 2 ? "bg-slate-400" :
                                     "bg-amber-700";
                return (
                  <Card key={s.symbol}
                    className={`p-5 text-center relative overflow-hidden border ${accentColor}`}>
                    <div className={`absolute top-0 left-0 w-full h-1 ${barColor}`} />
                    <div className={`text-3xl mb-3 ${isFirst ? "mt-0" : "mt-3"}`}>
                      {MEDALS[actualRank - 1]}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-amber-500 font-bold text-2xl">{s.symbol[0]}</span>
                    </div>
                    <p className={`${t.text} font-bold text-lg`}>{s.symbol}</p>
                    <p className={`${t.muted} text-xs mb-3`}>{NAMES[s.symbol] || s.symbol}</p>
                    <div className={`${t.dark ? "bg-white/5" : "bg-slate-50"} rounded-xl p-3 flex flex-col gap-2`}>
                      <div className="flex justify-between text-xs">
                        <span className={t.muted}>Total Trades</span>
                        <span className={`${t.text} font-bold`}>{s.totalTrades}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={t.muted}>Buys / Sells</span>
                        <span>
                          <span className="text-emerald-400 font-bold">{s.totalBuys}B</span>
                          <span className={`${t.muted} mx-1`}>/</span>
                          <span className="text-red-400 font-bold">{s.totalSells}S</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={t.muted}>Volume</span>
                        <span className="text-amber-500 font-bold">${Number(s.totalVolume).toLocaleString("en-US",{maximumFractionDigits:0})}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <Card>
            <CardHead
              icon={<Ic d={I.trophy} size={16} />}
              title="Stock Rankings"
              action={
                <span className={`${t.muted} text-xs`}>
                  Ranked by trade count
                </span>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${t.divider}`}>
                    {["Rank","Stock","Company","Buys","Sells","Total Trades","Shares Traded","Volume","Avg Price"].map((h) => (
                      <th key={h}
                        className={`px-4 py-3.5 text-left ${t.muted} text-xs font-semibold uppercase tracking-wide whitespace-nowrap`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.divider}`}>
                  {stocks.map((s) => (
                    <tr key={s.symbol} className={`${t.tableRow} transition-colors`}>
                      <td className="px-4 py-3.5">
                        <span className={`font-black text-base
                          ${s.rank === 1 ? "text-yellow-400" :
                            s.rank === 2 ? "text-slate-300" :
                            s.rank === 3 ? "text-amber-600" :
                                           t.muted}`}>
                          {s.rank <= 3 ? MEDALS[s.rank - 1] : `#${s.rank}`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                            <span className="text-amber-500 font-bold text-sm">{s.symbol[0]}</span>
                          </div>
                          <span className={`${t.text} font-bold`}>{s.symbol}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3.5 ${t.muted} text-xs`}>
                        {NAMES[s.symbol] || s.symbol}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-emerald-400 font-bold">{s.totalBuys}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-red-400 font-bold">{s.totalSells}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge color="amber">{s.totalTrades} trades</Badge>
                      </td>
                      <td className={`px-4 py-3.5 ${t.text} font-semibold`}>
                        {s.totalShares?.toLocaleString?.() ?? "—"} shares
                      </td>
                      <td className="px-4 py-3.5 text-amber-500 font-bold">
                        ${Number(s.totalVolume).toLocaleString("en-US",{maximumFractionDigits:0})}
                      </td>
                      <td className={`px-4 py-3.5 ${t.text} font-semibold`}>
                        ${fmt$(s.avgPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── User Leaderboard ─────────────────────────────────────────────
function UserLeaderboard() {
  const { user } = useAuth();
  const t = useT();
  const [data,    setData]    = useState([]);
  const [myRank,  setMyRank]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leaderboard")
      .then(({ data: d }) => { setData(d.leaderboard || []); setMyRank(d.myRank); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  );

  const top3 = data.slice(0, 3);

  return (
    <div className="flex flex-col gap-5">

      {/* My rank banner */}
      {myRank && (
        <div className={`border rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3
          ${t.dark ? "bg-amber-500/5 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-center gap-3">
            <span className="text-amber-500 font-black text-3xl">#{myRank.rank}</span>
            <div>
              <p className={`${t.text} font-bold`}>Your current rank</p>
              <p className={`${t.muted} text-xs`}>{myRank.tradeCount} trades · Started $100,000</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${myRank.totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {myRank.totalReturn >= 0 ? "+" : ""}${fmt$(myRank.totalReturn)}
            </p>
            <p className={`text-sm font-bold ${myRank.returnPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {myRank.returnPct >= 0 ? "+" : ""}{myRank.returnPct}% return
            </p>
          </div>
        </div>
      )}

      {/* Podium */}
      {top3.length === 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[top3[1], top3[0], top3[2]].map((p, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const isMe       = p.name === user?.name;
            const barColor   = actualRank === 1 ? "bg-yellow-400" : actualRank === 2 ? "bg-slate-400" : "bg-amber-700";
            return (
              <Card key={i}
                className={`p-5 text-center relative overflow-hidden ${actualRank === 1 ? "border-yellow-500/40" : ""}`}>
                <div className={`absolute top-0 left-0 w-full h-1 ${barColor}`} />
                <div className={`text-3xl mb-3 ${actualRank === 1 ? "mt-0" : "mt-3"}`}>
                  {MEDALS[actualRank - 1]}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 font-black text-lg
                  ${isMe ? "bg-amber-500 text-slate-900" : t.dark ? "bg-slate-700 text-amber-400" : "bg-slate-100 text-amber-600"}`}>
                  {p.name[0]}
                </div>
                <p className={`text-sm font-bold ${isMe ? "text-amber-400" : t.text}`}>{p.name}</p>
                <p className={`text-lg font-black mt-1 ${p.totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {p.totalReturn >= 0 ? "+" : ""}${Math.abs(p.totalReturn).toLocaleString("en-US",{maximumFractionDigits:0})}
                </p>
                <p className={`${t.muted} text-xs`}>{p.returnPct >= 0 ? "+" : ""}{p.returnPct}%</p>
                <p className={`${t.subtle} text-xs mt-1`}>{p.tradeCount} trades</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <Card>
        <CardHead icon={<Ic d={I.trophy} size={16} />} title="Full Rankings" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${t.divider}`}>
                {["Rank","Trader","Trades","Cash Balance","Total Return","Return %","Joined"].map((h) => (
                  <th key={h}
                    className={`px-4 py-3.5 text-left ${t.muted} text-xs font-semibold uppercase tracking-wide whitespace-nowrap`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${t.divider}`}>
              {data.map((p) => {
                const isMe = p.name === user?.name;
                return (
                  <tr key={p.rank}
                    className={`transition-colors ${isMe
                      ? t.dark ? "bg-amber-500/10" : "bg-amber-50"
                      : t.tableRow}`}>
                    <td className="px-4 py-3.5">
                      <span className={`font-black
                        ${p.rank === 1 ? "text-yellow-400 text-lg" :
                          p.rank === 2 ? "text-slate-300" :
                          p.rank === 3 ? "text-amber-600" :
                                         t.muted}`}>
                        {p.rank <= 3 ? MEDALS[p.rank - 1] : `#${p.rank}`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm
                          ${isMe
                            ? "bg-amber-500 text-slate-900"
                            : t.dark ? "bg-slate-700 text-amber-400" : "bg-slate-100 text-amber-600"}`}>
                          {p.name[0]}
                        </div>
                        <div>
                          <p className={`font-bold ${isMe ? "text-amber-400" : t.text}`}>{p.name}</p>
                          {isMe && <p className="text-amber-500 text-xs">← You</p>}
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3.5 ${t.muted}`}>{p.tradeCount}</td>
                    <td className={`px-4 py-3.5 ${t.text} font-bold`}>${fmt$(p.cashBalance)}</td>
                    <td className={`px-4 py-3.5 font-bold ${p.totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {p.totalReturn >= 0 ? "+" : ""}${fmt$(Math.abs(p.totalReturn))}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge color={p.returnPct >= 0 ? "green" : "red"}>
                        {p.returnPct >= 0 ? "+" : ""}{p.returnPct}%
                      </Badge>
                    </td>
                    <td className={`px-4 py-3.5 ${t.subtle} text-xs`}>
                      {new Date(p.joinedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className={`px-4 py-10 text-center ${t.muted}`}>
                    No traders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const t     = useT();
  const [tab, setTab] = useState("stocks");

  return (
    <Layout title="Leaderboard">
      <div className="flex flex-col gap-5">

        {/* Tab switcher */}
        <div className={`flex p-1 rounded-2xl gap-1 w-fit ${t.dark ? "bg-slate-800/80" : "bg-slate-100"}`}>
          {[
            ["stocks", "📈 Stock Rankings"],
            ["users",  "👤 Trader Rankings"],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all
                ${tab === key
                  ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/25"
                  : `${t.muted} hover:${t.text}`}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "stocks" ? <StockLeaderboard /> : <UserLeaderboard />}

      </div>
    </Layout>
  );
}