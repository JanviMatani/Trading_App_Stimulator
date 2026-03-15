import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// ─── Animated Demo Video ──────────────────────────────────────────
function DemoVideo({ onClose }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "📊 Dashboard Overview",
      desc:  "See your portfolio value, cash balance, P&L and recent trades at a glance",
      color: "#f59e0b",
      content: (
        <div className="flex flex-col gap-2 w-full">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Portfolio Value", val: "$1,02,450", color: "#f59e0b" },
              { label: "Unrealized P&L",  val: "+$2,450",   color: "#34d399" },
              { label: "Cash Balance",    val: "$78,320",    color: "#60a5fa" },
              { label: "Open Positions",  val: "4 stocks",   color: "#a855f7" },
            ].map((s, i) => (
              <div key={i} className="bg-slate-700/60 rounded-xl p-3 border border-slate-600/50"
                style={{ animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
                <p className="text-slate-400 text-xs mb-1">{s.label}</p>
                <p className="font-bold text-sm" style={{ color: s.color }}>{s.val}</p>
              </div>
            ))}
          </div>
          <div className="bg-slate-700/60 rounded-xl p-3 border border-slate-600/50"
            style={{ animation: "fadeUp 0.4s ease 0.4s both" }}>
            <p className="text-slate-400 text-xs mb-2">Portfolio (30-day)</p>
            <svg viewBox="0 0 300 60" className="w-full h-12">
              <defs>
                <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,50 L30,45 L60,48 L90,35 L120,38 L150,25 L180,28 L210,18 L240,22 L270,12 L300,8 L300,60 L0,60 Z"
                fill="url(#dg)" />
              <path d="M0,50 L30,45 L60,48 L90,35 L120,38 L150,25 L180,28 L210,18 L240,22 L270,12 L300,8"
                fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      title: "📈 Live Stock Prices",
      desc:  "Browse all 10 stocks with real-time prices, sparklines, and quick Buy/Sell buttons",
      color: "#34d399",
      content: (
        <div className="flex flex-col gap-2 w-full">
          {[
            { sym: "AAPL", name: "Apple Inc.",   price: "$189.30", chg: "+1.2%", up: true  },
            { sym: "NVDA", name: "NVIDIA Corp.", price: "$875.40", chg: "+3.4%", up: true  },
            { sym: "TSLA", name: "Tesla Inc.",   price: "$172.60", chg: "-0.8%", up: false },
            { sym: "MSFT", name: "Microsoft",    price: "$415.20", chg: "+0.5%", up: true  },
          ].map((s, i) => (
            <div key={i} className="bg-slate-700/60 rounded-xl px-3 py-2.5 border border-slate-600/50 flex items-center gap-3"
              style={{ animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <span className="text-amber-500 font-bold text-xs">{s.sym[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold">{s.sym}</p>
                <p className="text-slate-400 text-xs truncate">{s.name}</p>
              </div>
              <p className="text-white text-xs font-bold">{s.price}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                ${s.up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                {s.chg}
              </span>
              <div className="flex gap-1">
                <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-lg font-bold">B</span>
                <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-lg font-bold">S</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "💳 Buy & Sell Stocks",
      desc:  "Place orders with mock payment gateway — Visa, Mastercard, RuPay or UPI supported",
      color: "#60a5fa",
      content: (
        <div className="flex flex-col gap-3 w-full">
          <div className="bg-slate-900/60 rounded-xl p-1 flex gap-1"
            style={{ animation: "fadeUp 0.4s ease 0s both" }}>
            <div className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-emerald-500 text-white">▲ Buy</div>
            <div className="flex-1 py-2 text-center text-xs font-bold rounded-lg text-slate-400">▼ Sell</div>
          </div>
          <div className="bg-slate-700/60 rounded-xl p-3 border border-slate-600/50 flex justify-between items-center"
            style={{ animation: "fadeUp 0.4s ease 0.1s both" }}>
            <div>
              <p className="text-slate-400 text-xs">Selected Stock</p>
              <p className="text-white font-bold text-sm">AAPL — Apple Inc.</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Market Price</p>
              <p className="text-amber-500 font-bold text-lg">$189.30</p>
            </div>
          </div>
          <div className="bg-slate-700/60 rounded-xl border border-slate-600/50 flex items-center overflow-hidden"
            style={{ animation: "fadeUp 0.4s ease 0.2s both" }}>
            <div className="w-10 h-10 bg-slate-600 flex items-center justify-center text-white font-bold">−</div>
            <div className="flex-1 text-center text-white font-bold">5</div>
            <div className="w-10 h-10 bg-slate-600 flex items-center justify-center text-white font-bold">+</div>
          </div>
          <div className="bg-slate-700/60 rounded-xl p-3 border border-slate-600/50 flex justify-between"
            style={{ animation: "fadeUp 0.4s ease 0.3s both" }}>
            <span className="text-slate-400 text-xs">Total Amount</span>
            <span className="text-white font-bold text-sm">$946.50</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5"
            style={{ animation: "fadeUp 0.4s ease 0.4s both" }}>
            {["💳 Visa","💳 MC","💳 RuPay","📱 UPI"].map((p, i) => (
              <div key={i} className={`text-center py-1.5 rounded-lg text-xs border
                ${i === 0
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-slate-600 text-slate-400"}`}>
                {p}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "📁 Portfolio & P&L",
      desc:  "Track your holdings, unrealized gains/losses and full trade history in real-time",
      color: "#a855f7",
      content: (
        <div className="flex flex-col gap-2 w-full">
          {[
            { sym: "AAPL", qty: 5, avg: "$188.10", cur: "$189.30", pnl: "+$6.00",  pct: "+0.64%", up: true  },
            { sym: "NVDA", qty: 2, avg: "$860.00", cur: "$875.40", pnl: "+$30.80", pct: "+1.79%", up: true  },
            { sym: "TSLA", qty: 3, avg: "$175.20", cur: "$172.60", pnl: "-$7.80",  pct: "-1.48%", up: false },
            { sym: "META", qty: 1, avg: "$520.00", cur: "$527.30", pnl: "+$7.30",  pct: "+1.40%", up: true  },
          ].map((h, i) => (
            <div key={i} className="bg-slate-700/60 rounded-xl px-3 py-2.5 border border-slate-600/50 flex items-center gap-2"
              style={{ animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <span className="text-amber-500 font-bold text-xs">{h.sym[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold">{h.sym} <span className="text-slate-400 font-normal">×{h.qty}</span></p>
                <p className="text-slate-400 text-xs">Avg {h.avg} → {h.cur}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${h.up ? "text-emerald-400" : "text-red-400"}`}>{h.pnl}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                  ${h.up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                  {h.pct}
                </span>
              </div>
            </div>
          ))}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex justify-between"
            style={{ animation: "fadeUp 0.4s ease 0.5s both" }}>
            <span className="text-emerald-400 text-xs font-semibold">Total Unrealized P&L</span>
            <span className="text-emerald-400 font-bold text-sm">+$36.30 (+1.18%)</span>
          </div>
        </div>
      ),
    },
    {
      title: "🔔 Alerts & Watchlist",
      desc:  "Set price alerts and watch your favourite stocks — get notified when target is hit",
      color: "#f87171",
      content: (
        <div className="flex flex-col gap-2 w-full">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Watchlist</p>
          {[
            { sym: "GOOGL", price: "$175.80", chg: "+0.69%", up: true },
            { sym: "AMZN",  price: "$198.50", chg: "+0.66%", up: true },
            { sym: "JPM",   price: "$234.80", chg: "+0.56%", up: true },
          ].map((s, i) => (
            <div key={i} className="bg-slate-700/60 rounded-xl px-3 py-2 border border-slate-600/50 flex items-center gap-3"
              style={{ animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="text-amber-500 font-bold text-xs">{s.sym[0]}</span>
              </div>
              <span className="text-white text-xs font-bold flex-1">{s.sym}</span>
              <span className="text-white text-xs font-bold">{s.price}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                ${s.up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                {s.chg}
              </span>
              <span className="text-amber-500 text-xs">★</span>
            </div>
          ))}
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Active Alerts</p>
          {[
            { sym: "NVDA", cond: "Above $900", status: "Watching" },
            { sym: "TSLA", cond: "Below $165", status: "Watching" },
          ].map((a, i) => (
            <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center gap-3"
              style={{ animation: `fadeUp 0.4s ease ${(i + 3) * 0.1}s both` }}>
              <span className="text-amber-500 text-sm">🔔</span>
              <span className="text-white text-xs font-bold flex-1">{a.sym}</span>
              <span className="text-slate-400 text-xs">{a.cond}</span>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{a.status}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "🤖 AI Trading Assistant",
      desc:  "Chat with an AI that understands markets — get strategy advice, stock analysis and tips",
      color: "#818cf8",
      content: (
        <div className="flex flex-col gap-2 w-full">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-2 flex items-center gap-2"
            style={{ animation: "fadeUp 0.4s ease 0s both" }}>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 font-black text-xs">AI</span>
            </div>
            <span className="text-white text-xs font-bold flex-1">PaperTrade AI Assistant</span>
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Online
            </span>
          </div>
          {[
            { role: "user", text: "Should I buy NVDA right now?" },
            { role: "ai",   text: "NVDA has strong momentum from AI chip demand. Consider a small position but never invest more than 10% in one stock! 📊" },
            { role: "user", text: "What's a good stop-loss strategy?" },
            { role: "ai",   text: "Set stop-loss at 5-8% below your buy price. This limits downside while giving the stock room to breathe. 🛡️" },
          ].map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              style={{ animation: `fadeUp 0.4s ease ${(i + 1) * 0.12}s both` }}>
              {m.role === "ai" && (
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-amber-400 font-black" style={{ fontSize: 8 }}>AI</span>
                </div>
              )}
              <div className={`max-w-xs px-3 py-2 rounded-xl text-xs leading-relaxed
                ${m.role === "ai"
                  ? "bg-slate-700/80 text-slate-200 border-l-2 border-amber-500"
                  : "bg-amber-500/20 text-amber-100 border-r-2 border-amber-500"}`}>
                {m.text}
              </div>
              {m.role === "user" && (
                <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-slate-900 font-black" style={{ fontSize: 8 }}>U</span>
                </div>
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-1.5 mt-1"
            style={{ animation: "fadeUp 0.4s ease 0.6s both" }}>
            {["Explain P/E ratio", "Diversification tips"].map((q, i) => (
              <div key={i} className="bg-slate-700/60 border border-slate-600/50 rounded-lg px-2 py-1.5 text-slate-300 text-xs">
                "{q}"
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "📰 News Feed",
      desc:  "Stay updated with live market news — business headlines and stock-specific stories",
      color: "#fb923c",
      content: (
        <div className="flex flex-col gap-2 w-full">
          <div className="bg-slate-800 rounded-xl px-3 py-2 overflow-hidden"
            style={{ animation: "fadeUp 0.4s ease 0s both" }}>
            <div className="flex gap-6 text-xs overflow-hidden">
              {[
                { sym: "S&P 500", val: "5,842",  chg: "+0.42%", up: true  },
                { sym: "NASDAQ",  val: "18,239", chg: "-0.18%", up: false },
                { sym: "DOW",     val: "43,102", chg: "+0.31%", up: true  },
                { sym: "BTC",     val: "$68,420",chg: "-2.41%", up: false },
              ].map((tk, i) => (
                <span key={i} className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-400 font-semibold">{tk.sym}</span>
                  <span className="text-white font-bold">{tk.val}</span>
                  <span className={tk.up ? "text-emerald-400" : "text-red-400"}>{tk.chg}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl px-3 py-2 text-center border border-orange-500/20"
            style={{ animation: "fadeUp 0.4s ease 0.1s both" }}>
            <p className="text-white font-black text-base tracking-widest uppercase"
              style={{ fontFamily: "Georgia, serif" }}>The Daily Brief</p>
            <p className="text-orange-400/70 text-xs tracking-widest">Markets · Business · World</p>
          </div>
          {[
            { tag: "Market Focus", title: "NVIDIA hits record high on AI chip demand surge",      source: "Bloomberg",  time: "2h ago", color: "#34d399" },
            { tag: "Breaking",     title: "Fed holds rates steady amid inflation concerns",        source: "Reuters",    time: "4h ago", color: "#f87171" },
            { tag: "Tech",         title: "Apple unveils new product lineup for 2025",            source: "TechCrunch", time: "6h ago", color: "#60a5fa" },
          ].map((a, i) => (
            <div key={i} className="bg-slate-700/60 rounded-xl p-3 border border-slate-600/50"
              style={{ animation: `fadeUp 0.4s ease ${(i + 2) * 0.1}s both` }}>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block"
                style={{ background: a.color + "20", color: a.color }}>
                {a.tag}
              </span>
              <p className="text-white text-xs font-semibold leading-snug">{a.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-orange-400/70 text-xs font-semibold">{a.source}</span>
                <span className="text-slate-500 text-xs">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "🏆 Leaderboard",
      desc:  "Compete with other traders! See which stocks are most traded and who has top returns",
      color: "#fbbf24",
      content: (
        <div className="flex flex-col gap-2 w-full">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Most Traded Stocks</p>
          {[
            { rank: "🥇", sym: "AAPL", trades: 24, vol: "$45,230", buys: 18, sells: 6 },
            { rank: "🥈", sym: "NVDA", trades: 19, vol: "$89,450", buys: 14, sells: 5 },
            { rank: "🥉", sym: "TSLA", trades: 15, vol: "$28,100", buys:  9, sells: 6 },
            { rank: "#4", sym: "META", trades: 11, vol: "$31,200", buys:  8, sells: 3 },
          ].map((s, i) => (
            <div key={i} className="bg-slate-700/60 rounded-xl px-3 py-2.5 border border-slate-600/50 flex items-center gap-3"
              style={{ animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
              <span className="text-base w-6 text-center">{s.rank}</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="text-amber-500 font-bold text-xs">{s.sym[0]}</span>
              </div>
              <span className="text-white text-xs font-bold flex-1">{s.sym}</span>
              <div className="text-right">
                <p className="text-amber-500 text-xs font-bold">{s.trades} trades</p>
                <p className="text-slate-400 text-xs">
                  <span className="text-emerald-400">{s.buys}B</span>
                  {" / "}
                  <span className="text-red-400">{s.sells}S</span>
                </p>
              </div>
              <span className="text-slate-400 text-xs">{s.vol}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const stepsLength = steps.length;
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % stepsLength);
    }, 3000);
    return () => clearInterval(timer);
  }, [stepsLength]);

  const current = steps[step];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        style={{ animation: "fadeUp 0.4s ease both" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 7l-9.17 9.17-4.3-4.3L2 18" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">PaperTrade AI</p>
              <p className="text-amber-500 text-xs">Quick Tour</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl px-2">✕</button>
        </div>

        <div className="flex gap-1.5 px-6 pt-4">
          {steps.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className="flex-1 h-1 rounded-full transition-all duration-500"
              style={{ background: i === step ? current.color : "#334155" }} />
          ))}
        </div>

        <div className="px-6 py-4">
          <div className="mb-4" key={step} style={{ animation: "fadeUp 0.3s ease both" }}>
            <h3 className="text-white font-bold text-lg mb-1">{current.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{current.desc}</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 320 }} key={`content-${step}`}>
            {current.content}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep((s) => (s - 1 + stepsLength) % stepsLength)}
              className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors">←</button>
            <span className="text-slate-500 text-xs">{step + 1} / {stepsLength}</span>
            <button onClick={() => setStep((s) => (s + 1) % stepsLength)}
              className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors">→</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep((s) => (s + 1) % stepsLength)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
              Skip →
            </button>
            <button onClick={onClose}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-xl transition-colors">
              Start Trading 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────
export default function AuthPage() {
  const [mode,     setMode]     = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { login, register }     = useAuth();
  const { dark }                = useTheme();
  const navigate                = useNavigate();

  useEffect(() => {
    const seen = localStorage.getItem("pt_demo_seen");
    if (!seen) setShowDemo(true);
  }, []);

  const handleCloseDemo = () => {
    localStorage.setItem("pt_demo_seen", "true");
    setShowDemo(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        await register(name, email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Theme-aware styles
  const bg        = dark ? "#0f172a"  : "#f1f5f9";
  const leftBg    = dark
    ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
    : "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)";
  const cardBg    = dark ? "#1e293b"  : "#ffffff";
  const cardBdr   = dark ? "#334155"  : "#e2e8f0";
  const labelClr  = dark ? "#94a3b8"  : "#64748b";
  const inputBg   = dark ? "#0f172a"  : "#f8fafc";
  const inputBdr  = dark ? "#334155"  : "#cbd5e1";
  const inputClr  = dark ? "#f1f5f9"  : "#1e293b";
  const textMain  = dark ? "#f1f5f9"  : "#1e293b";
  const textMuted = dark ? "#94a3b8"  : "#64748b";
  const textSub   = dark ? "#64748b"  : "#94a3b8";
  const linkClr   = "#f59e0b";

  return (
    <div className="min-h-screen flex"
      style={{ fontFamily: "'Poppins',system-ui,sans-serif", background: bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      `}</style>

      {showDemo && <DemoVideo onClose={handleCloseDemo} />}

      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12"
        style={{ background: leftBg }}>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full"
          style={{ background: dark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.15)",
                   border: dark ? "1px solid rgba(245,158,11,0.1)" : "1px solid rgba(245,158,11,0.3)" }} />
        <div className="absolute top-40 -right-10 w-48 h-48 rounded-full"
          style={{ background: dark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.1)",
                   border: dark ? "1px solid rgba(245,158,11,0.1)" : "1px solid rgba(245,158,11,0.2)" }} />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full"
          style={{ background: dark ? "rgba(59,130,246,0.05)" : "rgba(59,130,246,0.08)",
                   border: dark ? "1px solid rgba(59,130,246,0.1)" : "1px solid rgba(59,130,246,0.2)" }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 7l-9.17 9.17-4.3-4.3L2 18" />
            </svg>
          </div>
          <div>
            <p style={{ color: textMain }} className="font-bold text-lg leading-none">PaperTrade</p>
            <p className="text-amber-500 text-xs font-medium">AI Simulator</p>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ animation: "fadeUp .6s ease both" }} className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight mb-4" style={{ color: textMain }}>
            Practice Trading.<br />
            <span className="text-amber-500">Zero Risk.</span>
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: textMuted }}>
            Trade real stocks with $100,000 virtual cash. Track your portfolio,
            compete on the leaderboard, and get AI-powered trading advice.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: "📈", text: "Real-time stock prices via Alpha Vantage" },
              { icon: "💳", text: "Mock payment gateway — Visa, Mastercard, UPI" },
              { icon: "🤖", text: "AI-powered trading assistant" },
              { icon: "🔔", text: "Real-time price alerts & watchlist" },
              { icon: "🏆", text: "Compete on the stock leaderboard" },
              { icon: "📰", text: "Live market news feed" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3"
                style={{ animation: `fadeUp .6s ease ${0.1 * i}s both` }}>
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm" style={{ color: textMuted }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Watch tour button */}
          <button onClick={() => setShowDemo(true)}
            className="mt-8 flex items-center gap-2 transition-colors text-sm font-semibold"
            style={{ color: linkClr }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)" }}>
              ▶
            </span>
            Watch Quick Tour
          </button>
        </div>

        <p className="text-xs relative z-10" style={{ color: textSub }}>
          © 2025 PaperTrade AI · No real money involved
        </p>
      </div>

      {/* Right — Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md" style={{ animation: "fadeUp .5s ease both" }}>

          {/* Mobile logo */}
          <div className="flex items-center justify-between gap-3 mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 7l-9.17 9.17-4.3-4.3L2 18" />
                </svg>
              </div>
              <div>
                <p className="font-bold" style={{ color: textMain }}>PaperTrade</p>
                <p className="text-amber-500 text-xs">AI Simulator</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: textMain }}>
            {mode === "login" ? "Welcome back 👋" : "Create account 🚀"}
          </h2>
          <p className="text-sm mb-8" style={{ color: textMuted }}>
            {mode === "login"
              ? "Sign in to your trading account"
              : "Start with $100,000 virtual cash — free forever"}
          </p>

          {/* Form card */}
          <div className="rounded-2xl p-6 mb-4 border"
            style={{ background: cardBg, borderColor: cardBdr,
                     boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)" }}>
            <form onSubmit={submit} className="flex flex-col gap-4">
              {mode === "register" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: labelClr }}>
                    Full Name
                  </label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl text-sm px-4 py-3 outline-none transition-colors"
                    style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: inputClr }} />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: labelClr }}>
                  Email
                </label>
                <input value={email} onChange={(e) => setEmail(e.target.value)}
                  type="email" placeholder="you@email.com"
                  className="w-full rounded-xl text-sm px-4 py-3 outline-none transition-colors"
                  style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: inputClr }} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: labelClr }}>
                  Password
                </label>
                <input value={password} onChange={(e) => setPassword(e.target.value)}
                  type="password" placeholder="••••••••"
                  className="w-full rounded-xl text-sm px-4 py-3 outline-none transition-colors"
                  style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: inputClr }} />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-3"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                style={{ background: "#f59e0b", color: "#0f172a" }}>
                {loading && (
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                )}
                {mode === "login" ? "Sign In" : "Create Account & Start Trading"}
              </button>
            </form>
          </div>

          <p className="text-sm text-center" style={{ color: textMuted }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="font-semibold transition-colors" style={{ color: linkClr }}>
              {mode === "login" ? "Register free" : "Sign in"}
            </button>
          </p>

          {/* Mobile tour button */}
          <button onClick={() => setShowDemo(true)}
            className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium transition-all lg:hidden"
            style={{ border: `1px solid ${cardBdr}`, color: textMuted, background: cardBg }}>
            ▶ Watch Quick Tour
          </button>

          {/* Theme hint */}
          <p className="text-xs text-center mt-4" style={{ color: textSub }}>
            {dark ? "🌙 Dark mode active" : "☀️ Light mode active"} · Toggle anytime from the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}