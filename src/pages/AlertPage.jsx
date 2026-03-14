import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card, Button, Modal, Input, Select, AlertBanner, Ic, I, fmt$, useT, Badge } from "../components/UI";
import { useAlerts } from "../context/AlertContext";

const NAMES   = { AAPL:"Apple",MSFT:"Microsoft",GOOGL:"Alphabet",AMZN:"Amazon",NVDA:"NVIDIA",META:"Meta",TSLA:"Tesla",JPM:"JPMorgan","BRK.B":"Berkshire",V:"Visa" };
const SYMBOLS = ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","JPM","V","BRK.B"];

export default function AlertsPage() {
  const { alerts, addAlert, removeAlert, clearTriggered } = useAlerts();
  const navigate = useNavigate();
  const t = useT();

  const [modal,  setModal]  = useState(false);
  const [sym,    setSym]    = useState("AAPL");
  const [target, setTarget] = useState("");
  const [cond,   setCond]   = useState("above");
  const [note,   setNote]   = useState("");
  const [err,    setErr]    = useState("");
  const [tab,    setTab]    = useState("active");

  const active    = alerts.filter((a) => !a.triggered);
  const triggered = alerts.filter((a) => a.triggered);
  const shown     = tab === "active" ? active : triggered;

  const handleAdd = () => {
    setErr("");
    if (!target || isNaN(parseFloat(target)) || parseFloat(target) <= 0) {
      setErr("Enter a valid target price");
      return;
    }
    addAlert(sym, target, cond, note);
    setModal(false);
    setTarget("");
    setNote("");
    setErr("");
  };

  return (
    <Layout title="Price Alerts"
      action={
        <Button onClick={() => setModal(true)} variant="primary" size="sm">
          <Ic d={I.plus} size={14} /> New Alert
        </Button>
      }>

      <Modal open={modal} onClose={() => { setModal(false); setErr(""); }} title="Set Price Alert">
        <div className="flex flex-col gap-4">
          <Select label="Stock" value={sym} onChange={(e) => setSym(e.target.value)}>
            {SYMBOLS.map((s) => <option key={s} value={s}>{s} — {NAMES[s]}</option>)}
          </Select>
          <Select label="Trigger Condition" value={cond} onChange={(e) => setCond(e.target.value)}>
            <option value="above">Alert when price goes ABOVE</option>
            <option value="below">Alert when price goes BELOW</option>
          </Select>
          <Input label="Target Price ($)" type="number" placeholder="e.g. 195.00" step="0.01"
            value={target} onChange={(e) => setTarget(e.target.value)} />
          <Input label="Personal Note (optional)" placeholder="e.g. Take profit level"
            value={note} onChange={(e) => setNote(e.target.value)} />
          <AlertBanner type="error" message={err} onClose={() => setErr("")} />
          <div className="flex gap-3 pt-1">
            <Button onClick={() => { setModal(false); setErr(""); }} variant="ghost" className="flex-1">Cancel</Button>
            <Button onClick={handleAdd} variant="primary" className="flex-1">
              <Ic d={I.bell} size={15} /> Set Alert
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col gap-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Active Alerts",    val: active.length,    color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
            { label: "Triggered Today",  val: triggered.length, color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
            { label: "Stocks Monitored", val: new Set(active.map((a) => a.symbol)).size, color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
          ].map((s, i) => (
            <Card key={i} className="p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: s.bg }}>
                <Ic d={I.bell} size={18} stroke={s.color} />
              </div>
              <p className={`${t.muted} text-xs mb-1`}>{s.label}</p>
              <p className="font-bold text-2xl" style={{ color: s.color }}>{s.val}</p>
            </Card>
          ))}
        </div>

        {/* Info */}
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm
          ${t.dark ? "bg-blue-500/5 border-blue-500/20 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
          <Ic d={I.bell} size={16} />
          <p>Alerts check live prices every <strong>30 seconds</strong>. You'll see a toast notification when triggered.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 items-center">
          {[["active", `Active (${active.length})`], ["triggered", `Triggered (${triggered.length})`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all
                ${tab === key ? "bg-amber-500 text-slate-900" : `${t.muted} ${t.hover}`}`}>
              {label}
            </button>
          ))}
          {triggered.length > 0 && tab === "triggered" && (
            <button onClick={clearTriggered}
              className="ml-auto px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              Clear all triggered
            </button>
          )}
        </div>

        {/* List */}
        {shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Ic d={I.bell} size={28} stroke="#f59e0b" />
            </div>
            <p className={`${t.text} font-semibold`}>
              {tab === "active" ? "No active alerts" : "No triggered alerts yet"}
            </p>
            {tab === "active" && (
              <Button onClick={() => setModal(true)} variant="primary">
                <Ic d={I.plus} size={15} /> Set First Alert
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((a) => (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                      ${a.triggered ? "bg-emerald-500/15" : "bg-amber-500/10"}`}>
                      <span className={`font-bold text-lg ${a.triggered ? "text-emerald-400" : "text-amber-500"}`}>
                        {a.symbol[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`${t.text} font-bold`}>{a.symbol}</p>
                        <Badge color={a.condition === "above" ? "green" : "red"}>
                          {a.condition === "above" ? "▲ Above" : "▼ Below"} ${fmt$(a.targetPrice)}
                        </Badge>
                        {a.triggered && <Badge color="slate">Triggered</Badge>}
                      </div>
                      {a.note && <p className={`${t.muted} text-xs mt-0.5 truncate`}>{a.note}</p>}
                      <p className={`${t.subtle} text-xs mt-1`}>
                        Set {new Date(a.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                        {a.triggeredAt && ` · Triggered at $${fmt$(a.triggeredPrice)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button onClick={() => navigate("/trade", { state: { symbol: a.symbol } })}
                      variant="outline" size="sm">Trade</Button>
                    <button onClick={() => removeAlert(a.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                      <Ic d={I.trash} size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}