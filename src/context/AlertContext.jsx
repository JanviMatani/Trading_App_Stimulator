import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api from "../utils/api";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pt_price_alerts") || "[]"); }
    catch { return []; }
  });
  const [toasts, setToasts] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("pt_price_alerts", JSON.stringify(alerts));
  }, [alerts]);

  const addToast = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 7000);
  }, []);

  const addAlert = useCallback((symbol, targetPrice, condition, note = "") => {
    const newAlert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      targetPrice: parseFloat(targetPrice),
      condition,
      note,
      triggered: false,
      createdAt: new Date().toISOString(),
    };
    setAlerts((p) => [...p, newAlert]);
    addToast(`Alert set: ${symbol} ${condition} $${parseFloat(targetPrice).toFixed(2)}`, "success");
    return newAlert.id;
  }, [addToast]);

  const removeAlert = useCallback((id) => {
    setAlerts((p) => p.filter((a) => a.id !== id));
  }, []);

  const clearTriggered = useCallback(() => {
    setAlerts((p) => p.filter((a) => !a.triggered));
  }, []);

  useEffect(() => {
    const active = alerts.filter((a) => !a.triggered);
    if (!active.length) { clearInterval(intervalRef.current); return; }

    const check = async () => {
      const symbols = [...new Set(active.map((a) => a.symbol))];
      for (const sym of symbols) {
        try {
          const { data } = await api.get(`/stocks/${sym}`);
          if (!data?.stock?.price) continue;
          const price = data.stock.price;
          active.filter((a) => a.symbol === sym).forEach((a) => {
            const hit =
              (a.condition === "above" && price >= a.targetPrice) ||
              (a.condition === "below" && price <= a.targetPrice);
            if (hit) {
              setAlerts((p) =>
                p.map((al) => al.id === a.id
                  ? { ...al, triggered: true, triggeredAt: new Date().toISOString(), triggeredPrice: price }
                  : al)
              );
              addToast(
                `🔔 ALERT: ${sym} is now $${price.toFixed(2)} — your target was ${a.condition} $${a.targetPrice}${a.note ? ` (${a.note})` : ""}`,
                "alert"
              );
            }
          });
        } catch { }
      }
    };

    check();
    intervalRef.current = setInterval(check, 30000);
    return () => clearInterval(intervalRef.current);
  }, [alerts, addToast]);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearTriggered, addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ fontFamily: "'Poppins',sans-serif" }}>
        {toasts.map((t) => (
          <div key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium min-w-72 max-w-sm
              ${t.type === "alert"   ? "bg-amber-500 text-slate-900" :
                t.type === "success" ? "bg-emerald-500 text-white" :
                t.type === "error"   ? "bg-red-500 text-white" :
                                       "bg-slate-800 text-white border border-slate-700"}`}
            style={{ animation: "slideIn .3s ease both" }}>
            <span className="flex-1 leading-snug">{t.msg}</span>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              className="opacity-70 hover:opacity-100 shrink-0 mt-0.5">✕</button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export const useAlerts = () => useContext(AlertContext);