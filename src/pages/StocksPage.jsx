import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, Sparkline, Spinner, Button, Ic, I, fmt$, genSparkline, useT, Badge } from "../components/UI";
import { useWatchlist } from "../context/WatchlistContext";
import api from "../utils/api";

export default function StocksPage() {
  const [stocks,  setStocks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [sort,    setSort]    = useState("symbol");
  const [sparks]              = useState({});
  const navigate              = useNavigate();
  const { toggle, has }       = useWatchlist();
  const t                     = useT();

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/stocks");
      const enriched = (data.stocks || []).map((s) => ({
        ...s,
        spark: sparks[s.symbol] || (sparks[s.symbol] = genSparkline(s.price)),
      }));
      setStocks(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStocks(); }, []);

  const filtered = stocks
    .filter((s) =>
      s.symbol.includes(search.toUpperCase()) ||
      s.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "price")  return b.price - a.price;
      if (sort === "change") return b.changePct - a.changePct;
      return a.symbol.localeCompare(b.symbol);
    });

  const gainers = [...stocks].filter((s) => s.change > 0).sort((a, b) => b.changePct - a.changePct).slice(0, 3);
  const losers  = [...stocks].filter((s) => s.change < 0).sort((a, b) => a.changePct - b.changePct).slice(0, 3);

  return (
    <Layout title="Live Stocks">
      <div className="flex flex-col gap-5">

        {/* Top Gainers / Losers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Top Gainers", list: gainers, up: true  },
            { label: "Top Losers",  list: losers,  up: false },
          ].map(({ label, list, up }) => (
            <Card key={label} className="p-4">
              <p className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5
                ${up ? "text-emerald-400" : "text-red-400"}`}>
                <span>{up ? "▲" : "▼"}</span>{label}
              </p>
              {list.length === 0 ? (
                <p className={`${t.muted} text-xs py-2`}>{loading ? "Loading…" : "No data"}</p>
              ) : list.map((s, i) => (
                <div key={i}
                  onClick={() => navigate(`/stocks/${s.symbol}`)}
                  className={`flex justify-between items-center py-2.5 border-b last:border-0
                    ${t.divider} cursor-pointer rounded-lg px-2 -mx-2 ${t.hover} transition-colors`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <span className="text-amber-500 font-bold text-xs">{s.symbol[0]}</span>
                    </div>
                    <span className={`${t.text} text-sm font-bold`}>{s.symbol}</span>
                  </div>
                  <span className={`${t.muted} text-xs font-medium`}>${fmt$(s.price)}</span>
                  <Badge color={up ? "green" : "red"}>
                    {s.changePct > 0 ? "+" : ""}{Number(s.changePct).toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </Card>
          ))}
        </div>

        {/* Search + Sort + Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 border ${t.border} rounded-xl px-3 py-2.5 flex-1 min-w-48
            ${t.dark ? "bg-[#1e2a3a]" : "bg-white"}`}>
            <Ic d={I.search} size={15} stroke="#94a3b8" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol or company…"
              className={`bg-transparent ${t.text} text-sm placeholder-slate-500 outline-none w-full`}
            />
          </div>
          <div className="flex gap-1.5">
            {[["symbol","A–Z"],["price","Price"],["change","Change"]].map(([val, label]) => (
              <button key={val} onClick={() => setSort(val)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors
                  ${sort === val
                    ? "bg-amber-500 text-slate-900"
                    : `${t.muted} ${t.hover} border ${t.border}`}`}>
                {label}
              </button>
            ))}
          </div>
          <Button onClick={fetchStocks} variant={t.dark ? "ghost" : "light"} size="sm" loading={loading}>
            <Ic d={I.refresh} size={14} /> Refresh
          </Button>
        </div>

        {/* Live indicator */}
        {!loading && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className={`${t.muted} text-xs font-medium`}>
              Live prices · Alpha Vantage · {filtered.length} stocks
            </span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Spinner size="lg" />
            <p className={`${t.muted} text-sm`}>Fetching live prices…</p>
          </div>
        ) : (
          /* Stock Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((s) => {
              const up  = (s.change || 0) >= 0;
              const inWl = has(s.symbol);
              return (
                <div key={s.symbol}
                  onClick={() => navigate(`/stocks/${s.symbol}`)}
                  className={`${t.card} border ${t.border} rounded-2xl p-5 cursor-pointer
                    transition-all duration-200 hover:scale-[1.02] hover:shadow-xl
                    ${t.dark
                      ? "hover:border-slate-500 hover:shadow-black/30"
                      : "hover:border-slate-300 hover:shadow-slate-200"}`}>

                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <span className="text-amber-500 font-bold text-lg">{s.symbol[0]}</span>
                      </div>
                      <div>
                        <p className={`${t.text} font-bold text-base`}>{s.symbol}</p>
                        <p className={`${t.muted} text-xs truncate max-w-[100px]`}>{s.name}</p>
                      </div>
                    </div>
                    {/* Watchlist star */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggle(s.symbol); }}
                      className={`p-1.5 rounded-lg transition-all
                        ${inWl ? "text-amber-500 bg-amber-500/10" : `${t.muted} ${t.hover}`}`}>
                      <Ic d={I.star} size={15}
                        fill={inWl ? "#f59e0b" : "none"}
                        stroke={inWl ? "#f59e0b" : "currentColor"}
                        sw={inWl ? 2 : 1.5} />
                    </button>
                  </div>

                  {/* Price + Change */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className={`${t.text} font-bold text-2xl`}>${fmt$(s.price)}</p>
                      <p className={`text-sm font-semibold mt-0.5
                        ${up ? "text-emerald-400" : "text-red-400"}`}>
                        {up ? "▲" : "▼"} {up ? "+" : ""}{fmt$(s.change)}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <Badge color={up ? "green" : "red"}>
                        {up ? "+" : ""}{Number(s.changePct).toFixed(2)}%
                      </Badge>
                      <Sparkline data={s.spark || []} up={up} w={70} h={32} />
                    </div>
                  </div>

                  {/* High / Low / Open */}
                  <div className={`grid grid-cols-3 gap-1 text-xs rounded-xl p-2.5 mb-4
                    ${t.dark ? "bg-white/5" : "bg-slate-50 border border-slate-100"}`}>
                    <div className="text-center">
                      <p className={`${t.muted} mb-0.5`}>High</p>
                      <p className="text-emerald-400 font-semibold">${fmt$(s.high)}</p>
                    </div>
                    <div className={`text-center border-x ${t.divider}`}>
                      <p className={`${t.muted} mb-0.5`}>Low</p>
                      <p className="text-red-400 font-semibold">${fmt$(s.low)}</p>
                    </div>
                    <div className="text-center">
                      <p className={`${t.muted} mb-0.5`}>Open</p>
                      <p className={`${t.text} font-semibold`}>${fmt$(s.open)}</p>
                    </div>
                  </div>

                  {/* Volume */}
                  <p className={`${t.muted} text-xs mb-4`}>
                    Vol:{" "}
                    <span className={`${t.text} font-medium`}>
                      {s.volume?.toLocaleString?.() ?? "—"}
                    </span>
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/trade", { state: { symbol: s.symbol, tab: "BUY" } });
                      }}
                      className="flex-1 py-2 text-xs font-bold rounded-xl
                        bg-emerald-500/15 text-emerald-500
                        hover:bg-emerald-500 hover:text-white transition-all duration-150">
                      ▲ Buy
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/trade", { state: { symbol: s.symbol, tab: "SELL" } });
                      }}
                      className="flex-1 py-2 text-xs font-bold rounded-xl
                        bg-red-500/15 text-red-400
                        hover:bg-red-500 hover:text-white transition-all duration-150">
                      ▼ Sell
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/stocks/${s.symbol}`);
                      }}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border
                        transition-all duration-150 ${t.border} ${t.muted} ${t.hover}`}>
                      <Ic d={I.eye} size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}