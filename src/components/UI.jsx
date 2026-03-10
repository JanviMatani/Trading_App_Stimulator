export const Ic = ({ d, size = 18, stroke = "currentColor", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const I = {
  home:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  stocks:  "M2 12h2l3-8 4 16 3-10 2 4 2-2h4",
  wallet:  "M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5M16 12a4 4 0 110-8 4 4 0 010 8z",
  history: "M12 8v4l3 3M3.05 11a9 9 0 1018 0",
  leader:  "M8 21v-5m4 5V10m4 11v-8",
  watch:   "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6z",
  chat:    "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  bot:     "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  buy:     "M12 5v14M5 12l7-7 7 7",
  sell:    "M12 19V5M5 12l7 7 7-7",
  bell:    "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  search:  "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  menu:    "M3 12h18M3 6h18M3 18h18",
  close:   "M18 6L6 18M6 6l12 12",
  trend:   "M22 7l-9.17 9.17-4.3-4.3L2 18",
  send:    "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  news:    "M4 6h16M4 10h16M4 14h8",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  trophy:  "M8 21h8M12 17v4M7 4H3l2 5c0 3.31 3.13 6 7 6s7-2.69 7-6l2-5h-4M7 4l5 9 5-9",
  portf:   "M2 20h20M5 20V10l7-7 7 7v10M9 20v-5h6v5",
  logout:  "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1",
  user:    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  check:   "M20 6L9 17l-5-5",
  warn:    "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  plus:    "M12 5v14M5 12h14",
};

export function Card({ children, className = "", accent }) {
  return (
    <div className={`bg-slate-700/80 border border-slate-500/40 ${className}`}>
      {accent && <div className={`h-0.5 w-full ${accent}`} />}
      {children}
    </div>
  );
}

export function CardHead({ icon, title, badge, action }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-500/40">
      <div className="flex items-center gap-2.5">
        <span className="text-amber-500">{icon}</span>
        <h3 className="text-white text-xs font-black tracking-widest uppercase" style={{ fontFamily: "Georgia,serif" }}>
          {title}
        </h3>
        {badge && <span className="bg-red-600 text-white text-xs font-black tracking-widest uppercase px-1.5 py-0.5">{badge}</span>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ size = "md" }) {
  const s = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-10 h-10" : "w-6 h-6";
  return <div className={`${s} border-2 border-amber-500 border-t-transparent rounded-full animate-spin`} />;
}

export function Button({ children, onClick, type = "button", variant = "primary", className = "", disabled = false, loading = false }) {
  const base = "flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-400 text-slate-900",
    danger:  "bg-red-500 hover:bg-red-400 text-white",
    success: "bg-emerald-500 hover:bg-emerald-400 text-slate-900",
    ghost:   "bg-slate-600 hover:bg-slate-500 text-slate-200 border border-slate-500/50",
    outline: "border border-amber-500/50 text-amber-400 hover:bg-amber-500/10",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-slate-400 text-xs tracking-widest uppercase font-semibold">{label}</label>}
      <input
        className={`bg-slate-600 border ${error ? "border-red-500" : "border-slate-500/50"} text-white text-sm px-4 py-2.5 outline-none placeholder-slate-500 focus:border-amber-500 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function Alert({ type = "error", message, onClose }) {
  const styles = {
    error:   "bg-red-500/10 border-red-500/40 text-red-300",
    success: "bg-emerald-500/10 border-emerald-500/40 text-emerald-300",
    warn:    "bg-amber-500/10 border-amber-500/40 text-amber-300",
  };
  if (!message) return null;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 border text-sm ${styles[type]}`}>
      <Ic d={type === "success" ? I.check : I.warn} size={16} />
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="opacity-60 hover:opacity-100"><Ic d={I.close} size={14} /></button>}
    </div>
  );
}

export function StatCard({ label, value, sub, up, icon, accent = "bg-amber-500" }) {
  return (
    <Card accent={accent} className="p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-amber-500 opacity-80"><Ic d={icon} size={18} /></span>
        {sub !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 ${up === true ? "bg-emerald-500/20 text-emerald-400" : up === false ? "bg-red-500/20 text-red-400" : "bg-slate-600 text-slate-300"}`}>
            {sub}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold mb-1">{label}</p>
      <p className="text-white text-xl font-black" style={{ fontFamily: "Georgia,serif" }}>{value}</p>
    </Card>
  );
}

export function Sparkline({ data = [], up, w = 80, h = 28 }) {
  if (!data.length) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path d={`M${pts.join("L")}`} fill="none" stroke={up ? "#34d399" : "#f87171"} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function fmt$(n) {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function genSparkline(base = 100, points = 20, vol = 0.018) {
  const arr = [base];
  for (let i = 1; i < points; i++) {
    const d = arr[i - 1] * (Math.random() * vol * 2 - vol);
    arr.push(+(arr[i - 1] + d).toFixed(2));
  }
  return arr;
}