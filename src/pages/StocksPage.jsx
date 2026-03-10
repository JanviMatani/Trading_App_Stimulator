import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, CardHead, Sparkline, Spinner, Button, Ic, I, fmt$, genSparkline } from "../components/UI";
import api from "../utils/api";

export default function StocksPage() {
  const [stocks,  setStocks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [sort,    setSort]    = useState("symbol");
  const [sparks]  = useState({});
  const navigate  = useNavigate();

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/stocks");
      const enriched = data.stocks.map((s) => ({
        ...s,
        spark: sparks[s.symbol] || (sparks[s.symbol] = genSparkline(s.price)),
      }));
      setStocks(enriched);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStocks(); }, []);

  const filtered = stocks
    .filter((s) =>
      s.symbol.includes(search.toUpperCase()) ||
      s.name?.toLowerCase().includes(search.toLowerCase()))
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
        {/* Gainers / Losers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ label: "▲ Top Gainers", list: gainers, up: true },
            { label: "▼ Top Losers",  list: losers,  up: false }].map(({ label, list, up }) => (
            <Card key={label} className="p-4">
              <p className={`text-xs font-black tracking-widest uppercase mb-3 ${up ? "text-emerald-400" : "text-red-400"}`}>{label}</p>
              {list.map((s, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-600/30 last:border-0">
                  <span className="text-white text-xs font-bold">{s.symbol}</span>
                  <span className="text-slate-400 text-xs">${fmt$(s.price)}</span>
                  <span className={`text-xs font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
                    {s.changePct > 0 ? "+" : ""}{Number(s.changePct).toFixed(2)}%
                  </span>
                </div>
              ))}
              {list.length === 0 && <p className="text-slate-500 text-xs">Loading…</p>}
            </Card>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-700 border border-slate-500/50 px-3 py-2 flex-1 min-w-48">
            <Ic d={I.search} size={14} stroke="#94a3b8" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol or company…"
              className="bg-transparent text-white text-xs placeholder-slate-500 outline-none w-full" />
          </div>
          <div className="flex gap-2">
            {[["symbol","A-Z"], ["price","Price"], ["change","Change"]].map(([val, label]) => (
              <button key={val} onClick={() => setSort(val)}
                className={`px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors
                  ${sort === val ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400 hover:text-white border border-slate-500/40"}`}>
                {label}
              </button>
            ))}
          </div>
          <Button onClick={fetchStocks} variant="ghost" loading={loading}>
            <Ic d={I.refresh} size={13} /> Refresh
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHead icon={<Ic d={I.stocks} size={16} />} title="All Stocks"
            badge={!loading ? "Live" : undefined}
            action={!loading && (
              <span className="text-emerald-400 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Alpha Vantage
              </span>
            )} />
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Spinner size="lg" />
              <p className="text-slate-400 text-sm">Fetching live prices from Alpha Vantage…</p>
              <p className="text-slate-500 text-xs">Free tier fetches sequentially (~5s per stock)</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-500/40">
                    {["Symbol","Company","Price","Change","Change %","Volume","High","Low","Trend","Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600/30">
                  {filtered.map((s, i) => {
                    const up = s.change >= 0;
                    return (
                      <tr key={i} className="hover:bg-slate-600/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-600 flex items-center justify-center">
                              <span className="text-amber-400 font-black text-xs">{s.symbol[0]}</span>
                            </div>
                            <span className="text-white font-bold">{s.symbol}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{s.name}</td>
                        <td className="px-4 py-3 text-white font-bold">${fmt$(s.price)}</td>
                        <td className={`px-4 py-3 font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
                          {up ? "+" : ""}{fmt$(s.change)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 font-bold ${up ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                            {up ? "+" : ""}{Number(s.changePct).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{s.volume?.toLocaleString?.() ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-300">${fmt$(s.high)}</td>
                        <td className="px-4 py-3 text-slate-300">${fmt$(s.low)}</td>
                        <td className="px-4 py-3">
                          <Sparkline data={s.spark || []} up={up} w={70} h={26} />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate("/trade", { state: { symbol: s.symbol, price: s.price, name: s.name } })}
                            className="px-2.5 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-900 text-xs font-black tracking-widest uppercase transition-all">
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}