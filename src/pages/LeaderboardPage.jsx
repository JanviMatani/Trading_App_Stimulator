import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card, CardHead, Spinner, Ic, I, fmt$ } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const MEDALS = ["🥇","🥈","🥉"];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data,    setData]    = useState([]);
  const [myRank,  setMyRank]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leaderboard")
      .then(({ data: d }) => { setData(d.leaderboard); setMyRank(d.myRank); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Leaderboard">
      <div className="flex justify-center py-40"><Spinner size="lg" /></div>
    </Layout>
  );

  const top3 = data.slice(0, 3);

  return (
    <Layout title="Leaderboard">
      <div className="flex flex-col gap-6">
        {/* My rank banner */}
        {myRank && (
          <div className="bg-amber-500/10 border border-amber-500/40 px-5 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-amber-500 font-black text-2xl">#{myRank.rank}</span>
              <div>
                <p className="text-white font-bold">Your current rank</p>
                <p className="text-slate-400 text-xs">{myRank.tradeCount} trades · Started $100,000</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-black ${myRank.totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}
                style={{ fontFamily: "Georgia,serif" }}>
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
              const isMe = p.name === user?.name;
              return (
                <Card key={i} className={`p-5 text-center relative overflow-hidden ${p.rank === 1 ? "border-yellow-500/50" : ""}`}>
                  <div className={`absolute top-0 left-0 w-full h-0.5 ${p.rank === 1 ? "bg-yellow-400" : p.rank === 2 ? "bg-slate-400" : "bg-amber-700"}`} />
                  <div className={`text-3xl mb-2 ${p.rank === 1 ? "mt-0" : "mt-4"}`}>{MEDALS[p.rank - 1]}</div>
                  <div className={`w-12 h-12 flex items-center justify-center mx-auto mb-2 font-black text-lg ${isMe ? "bg-amber-500 text-slate-900" : "bg-slate-600 text-amber-400"}`}>
                    {p.name[0]}
                  </div>
                  <p className={`text-xs font-bold ${isMe ? "text-amber-400" : "text-white"}`}>{p.name}</p>
                  <p className={`text-lg font-black mt-1 ${p.totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    style={{ fontFamily: "Georgia,serif" }}>
                    {p.totalReturn >= 0 ? "+" : ""}${Math.abs(p.totalReturn).toLocaleString(undefined,{maximumFractionDigits:0})}
                  </p>
                  <p className="text-slate-400 text-xs">{p.returnPct >= 0 ? "+" : ""}{p.returnPct}%</p>
                  <p className="text-slate-500 text-xs mt-1">{p.tradeCount} trades</p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <Card>
          <CardHead icon={<Ic d={I.trophy} size={16} />} title="Full Rankings" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-500/40">
                  {["Rank","Trader","Trades","Cash Balance","Total Return","Return %","Joined"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/30">
                {data.map((p, i) => {
                  const isMe = p.name === user?.name;
                  return (
                    <tr key={i} className={`transition-colors ${isMe ? "bg-amber-500/10" : "hover:bg-slate-600/20"}`}>
                      <td className="px-4 py-3">
                        <span className={`font-black ${p.rank === 1 ? "text-yellow-400 text-lg" : p.rank === 2 ? "text-slate-300" : p.rank === 3 ? "text-amber-600" : "text-slate-500"}`}>
                          {p.rank <= 3 ? MEDALS[p.rank - 1] : `#${p.rank}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 flex items-center justify-center font-black text-sm ${isMe ? "bg-amber-500 text-slate-900" : "bg-slate-600 text-amber-400"}`}>
                            {p.name[0]}
                          </div>
                          <div>
                            <p className={`font-bold ${isMe ? "text-amber-400" : "text-white"}`}>{p.name}</p>
                            {isMe && <p className="text-amber-500 text-xs">← You</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{p.tradeCount}</td>
                      <td className="px-4 py-3 text-white font-bold">${fmt$(p.cashBalance)}</td>
                      <td className={`px-4 py-3 font-bold ${p.totalReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {p.totalReturn >= 0 ? "+" : ""}${fmt$(Math.abs(p.totalReturn))}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 font-bold ${p.returnPct >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {p.returnPct >= 0 ? "+" : ""}{p.returnPct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(p.joinedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No traders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}