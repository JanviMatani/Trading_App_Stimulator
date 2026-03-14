import { useTheme } from "../context/ThemeContext";

export const Ic = ({ d, size = 18, stroke = "currentColor", sw = 1.8, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const I = {
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  stocks:   "M2 12h2l3-8 4 16 3-10 2 4 2-2h4",
  wallet:   "M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5M16 12a4 4 0 110-8 4 4 0 010 8z",
  history:  "M12 8v4l3 3M3.05 11a9 9 0 1018 0",
  leader:   "M8 21v-5m4 5V10m4 11v-8",
  watch:    "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6z",
  chat:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  bot:      "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  buy:      "M12 5v14M5 12l7-7 7 7",
  sell:     "M12 19V5M5 12l7 7 7-7",
  bell:     "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  menu:     "M3 12h18M3 6h18M3 18h18",
  close:    "M18 6L6 18M6 6l12 12",
  trend:    "M22 7l-9.17 9.17-4.3-4.3L2 18",
  send:     "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  news:     "M4 6h16M4 10h16M4 14h8",
  refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  trophy:   "M8 21h8M12 17v4M7 4H3l2 5c0 3.31 3.13 6 7 6s7-2.69 7-6l2-5h-4M7 4l5 9 5-9",
  portf:    "M2 20h20M5 20V10l7-7 7 7v10M9 20v-5h6v5",
  logout:   "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  check:    "M20 6L9 17l-5-5",
  warn:     "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  plus:     "M12 5v14M5 12h14",
  sun:      "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z",
  moon:     "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  alert:    "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  credit:   "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM12 9a3 3 0 100 6 3 3 0 000-6z",
  chart:    "M18 20V10M12 20V4M6 20v-6",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  arrowR:   "M5 12h14M12 5l7 7-7 7",
  lock:     "M12 1a4 4 0 014 4v3H8V5a4 4 0 014-4zM4 10h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 012-2z",
};

export function useT() {
  const { dark } = useTheme();
  return {
    dark,
    bg:        dark ? "bg-[#1a2236]"                    : "bg-slate-100",
    surface:   dark ? "bg-[#1e2a3a]"                    : "bg-white",
    card:      dark ? "bg-[#1e2a3a]"                    : "bg-white",
    border:    dark ? "border-slate-600/50"              : "border-slate-200",
    text:      dark ? "text-slate-100"                   : "text-slate-800",
    muted:     dark ? "text-slate-400"                   : "text-slate-500",
    subtle:    dark ? "text-slate-500"                   : "text-slate-400",
    input:     dark
      ? "bg-[#253347] border-slate-600 text-slate-100 placeholder-slate-500 focus:border-amber-500"
      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-amber-500",
    hover:     dark ? "hover:bg-white/5"                 : "hover:bg-slate-50",
    tableRow:  dark ? "hover:bg-white/5"                 : "hover:bg-slate-50",
    divider:   dark ? "border-slate-600/50"              : "border-slate-200",
    header:    dark ? "bg-[#1a2236] border-slate-600/50" : "bg-white border-slate-200",
    sidebar:   dark ? "bg-[#141d2e] border-slate-600/50" : "bg-white border-slate-200",
    navActive: dark
      ? "bg-amber-500/15 text-amber-400 border-r-2 border-amber-500"
      : "bg-amber-50 text-amber-600 border-r-2 border-amber-500",
    navIdle:   dark
      ? "text-slate-400 hover:text-slate-100 hover:bg-white/5"
      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
    shadow:    dark ? "shadow-lg shadow-black/20"        : "shadow-sm shadow-slate-200",
    badge: {
      green:  dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700 border border-emerald-200",
      red:    dark ? "bg-red-500/15 text-red-400"         : "bg-red-50 text-red-700 border border-red-200",
      amber:  dark ? "bg-amber-500/15 text-amber-400"     : "bg-amber-50 text-amber-700 border border-amber-200",
      blue:   dark ? "bg-blue-500/15 text-blue-400"       : "bg-blue-50 text-blue-700 border border-blue-200",
      purple: dark ? "bg-purple-500/15 text-purple-400"   : "bg-purple-50 text-purple-700 border border-purple-200",
      slate:  dark ? "bg-slate-700/80 text-slate-300"     : "bg-slate-100 text-slate-600 border border-slate-200",
    },
  };
}

export function Card({ children, className = "", onClick }) {
  const t = useT();
  return (
    <div onClick={onClick}
      className={`${t.card} border ${t.border} rounded-2xl overflow-hidden ${t.shadow}
        ${onClick ? "cursor-pointer transition-transform hover:scale-[1.01]" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function CardHead({ icon, title, badge, action }) {
  const t = useT();
  return (
    <div className={`flex items-center justify-between px-5 py-4 border-b ${t.divider}`}>
      <div className="flex items-center gap-2.5">
        <span className="text-amber-500">{icon}</span>
        <h3 className={`${t.text} text-sm font-semibold`}>{title}</h3>
        {badge && (
          <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ size = "md" }) {
  const s = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-10 h-10" : "w-6 h-6";
  return <div className={`${s} border-2 border-amber-500 border-t-transparent rounded-full animate-spin`} />;
}

export function Button({ children, onClick, type = "button", variant = "primary",
  className = "", disabled = false, loading = false, size = "md" }) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold shadow-lg shadow-amber-500/25",
    danger:  "bg-red-500 hover:bg-red-400 text-white font-semibold shadow-lg shadow-red-500/20",
    success: "bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/20",
    ghost:   "bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600 font-medium",
    outline: "border border-amber-500/60 text-amber-500 hover:bg-amber-500/10 font-medium",
    light:   "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`flex items-center justify-center rounded-xl transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizes[size]} ${variants[variant]} ${className}`}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export function Input({ label, error, className = "", icon, ...props }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className={`${t.muted} text-xs font-semibold tracking-wide uppercase`}>{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.muted}`}>{icon}</span>
        )}
        <input
          className={`w-full border rounded-xl text-sm px-4 py-2.5 outline-none transition-colors
            ${t.input} ${icon ? "pl-9" : ""} ${error ? "!border-red-500" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
    </div>
  );
}

export function Select({ label, children, className = "", ...props }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className={`${t.muted} text-xs font-semibold tracking-wide uppercase`}>{label}</label>
      )}
      <select
        className={`w-full border rounded-xl text-sm px-4 py-2.5 outline-none
          transition-colors appearance-none ${t.input} ${className}`}
        {...props}>
        {children}
      </select>
    </div>
  );
}

export function AlertBanner({ type = "error", message, onClose }) {
  const styles = {
    error:   "bg-red-500/10 border-red-500/30 text-red-400",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    warn:    "bg-amber-500/10 border-amber-500/30 text-amber-500",
  };
  if (!message) return null;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 border rounded-xl text-sm ${styles[type]}`}>
      <Ic d={type === "success" ? I.check : I.warn} size={15} />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 mt-0.5">
          <Ic d={I.close} size={13} />
        </button>
      )}
    </div>
  );
}

const COLOR_MAP = {
  "bg-amber-500":   { bg: "rgba(245,158,11,0.12)",  text: "#f59e0b" },
  "bg-emerald-500": { bg: "rgba(52,211,153,0.12)",  text: "#34d399" },
  "bg-red-500":     { bg: "rgba(248,113,113,0.12)", text: "#f87171" },
  "bg-blue-500":    { bg: "rgba(59,130,246,0.12)",  text: "#3b82f6" },
  "bg-purple-500":  { bg: "rgba(168,85,247,0.12)",  text: "#a855f7" },
};

export function StatCard({ label, value, sub, up, icon, accent = "bg-amber-500", trend }) {
  const t = useT();
  const c = COLOR_MAP[accent] || COLOR_MAP["bg-amber-500"];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: c.bg }}>
          <span style={{ color: c.text }}><Ic d={icon} size={20} /></span>
        </div>
        {sub !== undefined && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
            ${up === true  ? "bg-emerald-500/15 text-emerald-400" :
              up === false ? "bg-red-500/15 text-red-400" :
                             t.dark
                               ? "bg-slate-700 text-slate-300"
                               : "bg-slate-100 text-slate-600"}`}>
            {sub}
          </span>
        )}
      </div>
      <p className={`${t.muted} text-xs font-medium mb-1`}>{label}</p>
      <p className={`${t.text} text-xl font-bold`}>{value}</p>
      {trend && <p className={`${t.subtle} text-xs mt-1`}>{trend}</p>}
    </Card>
  );
}

export function Sparkline({ data = [], up, w = 80, h = 30 }) {
  if (!data.length) return <div style={{ width: w, height: h }} />;
  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;
  const pts   = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const col      = up ? "#34d399" : "#f87171";
  const firstX   = pts[0].split(",")[0];
  const lastX    = pts[pts.length - 1].split(",")[0];
  const fillPath = `M${pts.join("L")} L${lastX},${h} L${firstX},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id={`sg${up ? "u" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={col} stopOpacity="0.3" />
          <stop offset="100%" stopColor={col} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg${up ? "u" : "d"})`} />
      <path d={`M${pts.join("L")}`} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Badge({ children, color = "amber" }) {
  const t = useT();
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
      ${t.badge[color] || t.badge.amber}`}>
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children, width = "max-w-md" }) {
  const t = useT();
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${t.card} border ${t.border} w-full ${width} rounded-2xl shadow-2xl`}
        style={{ animation: "fadeUp .25s ease both" }}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${t.divider}`}>
          <h3 className={`${t.text} font-bold`}>{title}</h3>
          <button onClick={onClose}
            className={`${t.muted} transition-colors p-1.5 rounded-lg ${t.hover}`}>
            <Ic d={I.close} size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} title={dark ? "Switch to Light mode" : "Switch to Dark mode"}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
        ${dark
          ? "bg-slate-700/80 text-amber-400 hover:bg-slate-700 border border-slate-600"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"}`}>
      <Ic d={dark ? I.sun : I.moon} size={15} />
    </button>
  );
}

export function fmt$(n) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function genSparkline(base = 100, points = 20, vol = 0.02) {
  const arr = [base];
  for (let i = 1; i < points; i++) {
    const d = arr[i - 1] * (Math.random() * vol * 2 - vol);
    arr.push(+(arr[i - 1] + d).toFixed(2));
  }
  return arr;
}