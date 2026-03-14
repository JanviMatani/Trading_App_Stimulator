import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, Spinner, Button, Modal, Input, Select, AlertBanner, Ic, I, fmt$, genSparkline, useT, Badge, Sparkline } from "../components/UI";
import { useWatchlist } from "../context/WatchlistContext";
import { useAlerts } from "../context/AlertContext";
import api from "../utils/api";

const ALL_SYMBOLS = ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","JPM","V","BRK.B"];
const NAMES = { AAPL:"Apple",MSFT:"Microsoft",GOOGL:"Alphabet",AMZN:"Amazon",NVDA:"NVIDIA",META:"Meta",TSLA:"Tesla",JPM:"JPMorgan","BRK.B":"Berkshire",V:"Visa" };

export default function WatchlistPage() {
  const { watchlist, add, remove, has } = useWatchlist();
  const { addAlert } = useAlerts();
  const navigate = useNavigate();
  const t = useT();

  const [quotes,      setQuotes]      = useState({});
  const [sparks]                      = useState({});
  const [loading,     setLoading]     = useState(true);
  const [addModal,    setAddModal]    = useState(false);
  const [alertModal,  setAlertModal]  = useState(null);
  const [newSym,      setNewSym]      = useState("AAPL");
  const [alertTarget, setAlertTarget] = useState("");
  const [alertCond,   setAlertCond]   = useState("above");
  const [alertNote,   setAlertNote]   = useState("");
  const [alertErr,    setAlertErr]    = useState("");

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/stocks");
      const map = {};
      (data.stocks || []).forEach((s) => { map[s.symbol] = s; });
      setQuotes(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuotes(); }, []);

  const handleAddAlert = () => {
    setAlertErr("");
    if (!alertTarget || isNaN(parseFloat(alertTarget)) || parseFloat(alertTarget) <= 0) {
      setAlertErr("Enter a valid target price");
      return;
    }
    addAlert(alertModal, alertTarget, alertCond, alertNote);
    setAlertModal(null);
    setAlertTarget("");
    setAlertCond("above");
    setAlertNote("");
  };

  const wlStocks = watchlist.map((sym) => ({
    symbol: sym,
    name:   NAMES[sym] || sym,
    quote:  quotes[sym] || null,
    spark:  sparks[sym] || (sparks[sym] = genSparkline(quotes[sym]?.price || 150)),
  }));

  return (
    <Layout title="Watchlist">

      {/* Add symbol modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add to Watchlist">
        <Select label="Select Stock" value={newSym} onChange={(e) => setNewSym(e.target.value)}>
          {ALL_SYMBOLS.filter((s) => !has(s)).map((s) => (
            <option key={s} value={s}>{s} — {NAMES[s]}</option>
          ))}
        </Select>
        <div className="mt-5 flex gap-3">
          <Button onClick={() => setAddModal(false)} variant="ghost" className="flex-1">Cancel</Button>
          <Button onClick={() => { add(newSym); setAddModal(false); }} variant="primary" className="flex-1">
            <Ic d={I.plus} size={15} /> Add to Watchlist
          </Button>
        </div>
      </Modal>

      {/* Set alert modal */}
      <Modal open={!!alertModal} onClose={() => { setAlertModal(null); setAlertErr(""); }} title={`Set Alert — ${alertModal}`}>
        <div className="flex flex-col gap-4">
          <div className={`${t.dark ? "bg-slate-700/50" : "bg-slate-50"} rounded-xl p-3 flex items-center justify-between`}>
            <span className={`${t.muted} text-sm`}>Current Price</span>
            <span className={`${t.text} font-bold text-lg`}>
              {quotes[alertModal] ? `$${fmt$(quotes[alertModal].price)}` : "—"}
            </span>
          </div>
          <Select label="Condition" value={alertCond} onChange={(e) => setAlertCond(e.target.value)}>
            <option value="above">Price goes ABOVE target</option>
            <option value="below">Price goes BELOW target</option>
          </Select>
          <Input label="Target Price ($)" type="number" placeholder="e.g. 195.00" step="0.01"
            value={alertTarget} onChange={(e) => setAlertTarget(e.target.value)} />
          <Input label="Note (optional)" placeholder="e.g. Sell at this price"
            value={alertNote} onChange={(e) => setAlertNote(e.target.value)} />
          <AlertBanner type="error" message={alertErr} onClose={() => setAlertErr("")} />
          <Button onClick={handleAddAlert} variant="primary" className="w-full">
            <Ic d={I.bell} size={15} /> Set Alert
          </Button>
        </div>
      </Modal>

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className={`${t.muted} text-sm`}>
            {watchlist.length} stock{watchlist.length !== 1 ? "s" : ""} in your watchlist
          </p>
          <div className="flex gap-2">
            <Button onClick={fetchQuotes} variant="ghost" size="sm">
              <Ic d={I.refresh} size={14} /> Refresh
            </Button>
            <Button onClick={() => setAddModal(true)} variant="primary" size="sm">
              <Ic d={I.plus} size={14} /> Add Stock
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-32"><Spinner size="lg" /></div>
        ) : watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Ic d={I.star} size={28} stroke="#f59e0b" />
            </div>
            <p className={`${t.text} font-semibold`}>Your watchlist is empty</p>
            <p className={`${t.muted} text-sm`}>Add stocks you want to monitor</p>
            <Button onClick={() => setAddModal(true)} variant="primary">
              <Ic d={I.plus} size={15} /> Add Your First Stock
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {wlStocks.map((s) => {
              const q  = s.quote;
              const up = q ? q.change >= 0 : true;
              return (
                <Card key={s.symbol} className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <span className="text-amber-500 font-bold text-lg">{s.symbol[0]}</span>
                      </div>
                      <div>
                        <p className={`${t.text} font-bold`}>{s.symbol}</p>
                        <p className={`${t.muted} text-xs`}>{s.name}</p>
                      </div>
                    </div>
                    <button onClick={() => remove(s.symbol)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                      <Ic d={I.trash} size={14} />
                    </button>
                  </div>

                  {q ? (
                    <>
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p className={`${t.text} font-bold text-2xl`}>${fmt$(q.price)}</p>
                          <p className={`text-sm font-semibold mt-0.5 ${up ? "text-emerald-400" : "text-red-400"}`}>
                            {up ? "▲" : "▼"} ${fmt$(Math.abs(q.change))} ({Number(q.changePct).toFixed(2)}%)
                          </p>
                        </div>
                        <Sparkline data={s.spark} up={up} w={80} h={36} />
                      </div>
                      <div className={`grid grid-cols-2 gap-2 text-xs ${t.dark ? "bg-slate-900/40" : "bg-slate-50"} rounded-xl p-3 mb-4`}>
                        <div><span className={t.muted}>Open</span><p className={`${t.text} font-semibold`}>${fmt$(q.open)}</p></div>
                        <div><span className={t.muted}>Volume</span><p className={`${t.text} font-semibold`}>{q.volume?.toLocaleString?.()}</p></div>
                        <div><span className={t.muted}>High</span><p className="text-emerald-400 font-semibold">${fmt$(q.high)}</p></div>
                        <div><span className={t.muted}>Low</span><p className="text-red-400 font-semibold">${fmt$(q.low)}</p></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-6 mb-4">
                      <Spinner size="sm" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={() => setAlertModal(s.symbol)} variant="ghost" size="sm" className="flex-1">
                      <Ic d={I.bell} size={13} /> Alert
                    </Button>
                    <Button onClick={() => navigate("/trade", { state: { symbol: s.symbol } })} variant="primary" size="sm" className="flex-1">
                      <Ic d={I.buy} size={13} /> Trade
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}