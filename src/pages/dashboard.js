import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════
   ⚠️  PUT YOUR ALPHA VANTAGE KEY HERE
══════════════════════════════════════════════════════ */
const AV_KEY = "YOUR_API_KEY_HERE";
const AV = (sym) =>
  `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${AV_KEY}`;

const SYMBOLS = [
  { sym: "AAPL",  name: "Apple Inc."          },
  { sym: "MSFT",  name: "Microsoft Corp."      },
  { sym: "GOOGL", name: "Alphabet Inc."        },
  { sym: "AMZN",  name: "Amazon.com Inc."      },
  { sym: "NVDA",  name: "NVIDIA Corp."         },
  { sym: "META",  name: "Meta Platforms"       },
  { sym: "TSLA",  name: "Tesla Inc."           },
  { sym: "BRK.B", name: "Berkshire Hathaway"  },
  { sym: "JPM",   name: "JPMorgan Chase"       },
  { sym: "V",     name: "Visa Inc."            },
];

/* ── Static mock fallbacks (used if API rate‑limited) ── */
const FALLBACK = {
  AAPL:  { price:189.42, chg:1.23,   pct:0.65  },
  MSFT:  { price:415.80, chg:2.10,   pct:0.51  },
  GOOGL: { price:172.34, chg:0.87,   pct:0.51  },
  AMZN:  { price:198.12, chg:-1.55,  pct:-0.78 },
  NVDA:  { price:875.40, chg:18.20,  pct:2.12  },
  META:  { price:512.76, chg:6.44,   pct:1.27  },
  TSLA:  { price:241.05, chg:-4.30,  pct:-1.75 },
  "BRK.B":{ price:398.55,chg:-0.95, pct:-0.24 },
  JPM:   { price:198.22, chg:1.45,   pct:0.74  },
  V:     { price:275.90, chg:-0.62,  pct:-0.22 },
};

/* ── Static data ── */
const LEADERBOARD_DATA = [
  { rank:1, name:"Aryan K.",  pnl:"+$14,820", ret:"+18.2%", trades:142 },
  { rank:2, name:"Priya S.",  pnl:"+$11,340", ret:"+14.7%", trades:98  },
  { rank:3, name:"Rohan M.",  pnl:"+$9,210",  ret:"+12.1%", trades:87  },
  { rank:4, name:"You",       pnl:"+$6,430",  ret:"+8.6%",  trades:61, isMe:true },
  { rank:5, name:"Sneha P.",  pnl:"+$5,980",  ret:"+7.8%",  trades:74  },
  { rank:6, name:"Dev T.",    pnl:"+$4,310",  ret:"+5.9%",  trades:55  },
  { rank:7, name:"Riya M.",   pnl:"+$3,870",  ret:"+5.2%",  trades:48  },
];

const TRADES_DATA = [
  { id:1, sym:"AAPL", type:"BUY",  qty:10, price:187.20, total:1872.00, time:"09:32 AM", date:"Mar 8" },
  { id:2, sym:"NVDA", type:"SELL", qty:5,  price:860.00, total:4300.00, time:"10:15 AM", date:"Mar 8" },
  { id:3, sym:"TSLA", type:"BUY",  qty:8,  price:245.30, total:1962.40, time:"11:03 AM", date:"Mar 7" },
  { id:4, sym:"MSFT", type:"BUY",  qty:3,  price:413.50, total:1240.50, time:"01:22 PM", date:"Mar 7" },
  { id:5, sym:"META", type:"SELL", qty:6,  price:510.00, total:3060.00, time:"02:47 PM", date:"Mar 6" },
  { id:6, sym:"GOOGL",type:"BUY",  qty:4,  price:170.20, total:680.80,  time:"09:05 AM", date:"Mar 6" },
  { id:7, sym:"V",    type:"SELL", qty:12, price:274.00, total:3288.00, time:"03:15 PM", date:"Mar 5" },
];

const COMMUNITY_MSGS = [
  { user:"Aryan K.", msg:"Anyone holding NVDA into earnings? 🚀", time:"2m ago" },
  { user:"Priya S.", msg:"Sold half my position, too risky.", time:"1m ago" },
  { user:"Rohan M.", msg:"AAPL looking bullish on the daily chart 📈", time:"45s ago" },
  { user:"Dev T.",   msg:"JPM breaking out — watch this one!", time:"30s ago" },
];

const AI_RESPONSES = [
  "Based on recent momentum, NVDA shows strong bullish signals — RSI is healthy at 58. Always manage your risk!",
  "Diversification across sectors is key. Consider balancing tech with defensive stocks like V or JPM.",
  "Your portfolio P&L looks healthy. Consider setting a stop‑loss at −5% per position to protect gains.",
  "AAPL has strong fundamentals. The 50‑day MA is trending up — a potential support level for entries.",
  "Paper trading is risk‑free — experiment boldly! Try different strategies to learn what suits your style.",
  "META is showing a bullish pennant pattern on the 4H chart. Watch for a breakout above $515.",
  "Remember: even professional traders lose on ~40% of trades. What matters is your risk‑reward ratio!",
];

/* ══════════════════════════════════════════════════════
   UTILITY FUNCTIONS
══════════════════════════════════════════════════════ */
function genSparkline(base = 100, points = 20, vol = 0.018) {
  const arr = [base];
  for (let i = 1; i < points; i++) {
    const d = arr[i-1] * (Math.random() * vol * 2 - vol);
    arr.push(+(arr[i-1] + d).toFixed(2));
  }
  return arr;
}

function sparkPath(data, w = 80, h = 28) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M${pts.join("L")}`;
}

function genPortfolioHistory() {
  let val = 68000;
  const data = [];
  for (let i = 30; i >= 0; i--) {
    val += (Math.random() - 0.40) * 900;
    const d = new Date(); d.setDate(d.getDate() - i);
    data.push({
      day: d.toLocaleDateString("en-US", { month:"short", day:"numeric" }),
      val: Math.max(58000, +val.toFixed(0)),
    });
  }
  return data;
}

function fmt$(n) {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

/* ══════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════ */
const Ic = ({ d, size=18, stroke="currentColor", sw=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const I = {
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
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  plus:     "M12 5v14M5 12h14",
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  chevR:    "M9 18l6-6-6-6",
  chevL:    "M15 18l-6-6 6-6",
};

/* ══════════════════════════════════════════════════════
   REUSABLE CARD
══════════════════════════════════════════════════════ */
function Card({ children, className="", glass=false }) {
  return (
    <div className={`
      bg-slate-700/80 border border-slate-500/40 
      ${glass ? "backdrop-blur-sm" : ""}
      ${className}
    `}>
      {children}
    </div>
  );
}

function CardHead({ icon, title, badge, action }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-500/40">
      <div className="flex items-center gap-2.5">
        <span className="text-amber-500">{icon}</span>
        <h3 className="text-white text-xs font-black tracking-widest uppercase" style={{ fontFamily:"Georgia,serif" }}>
          {title}
        </h3>
        {badge && (
          <span className="bg-red-600 text-white text-xs font-black tracking-widest uppercase px-1.5 py-0.5">
            {badge}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SPARKLINE SVG
══════════════════════════════════════════════════════ */
function Sparkline({ data, up, w=80, h=28 }) {
  if (!data?.length) return null;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path d={sparkPath(data, w, h)} fill="none"
        stroke={up ? "#34d399" : "#f87171"} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   PORTFOLIO CHART
══════════════════════════════════════════════════════ */
function PortfolioChart({ data }) {
  const W=700, H=150;
  const vals = data.map(d=>d.val);
  const min=Math.min(...vals), max=Math.max(...vals), range=max-min||1;
  const pts = vals.map((v,i)=>[
    (i/(vals.length-1))*W,
    H-((v-min)/range)*(H-20)-10
  ]);
  const line = pts.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const pct  = ((vals.at(-1)-vals[0])/vals[0]*100).toFixed(2);
  const up   = pct>=0;
  const color= up?"#34d399":"#f87171";

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold">Portfolio Value · 30‑Day</p>
          <p className="text-white text-3xl font-black mt-1" style={{fontFamily:"Georgia,serif"}}>
            ${vals.at(-1).toLocaleString()}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            Base <span className="text-white">${vals[0].toLocaleString()}</span>
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-sm ${up?"bg-emerald-500/20 text-emerald-400":"bg-red-500/20 text-red-400"}`}>
          {up?"▲":"▼"} {Math.abs(pct)}%
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:130}}>
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#pg)"/>
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="5"
          fill={color} stroke="#334155" strokeWidth="2.5"/>
      </svg>
      <div className="flex justify-between mt-2">
        {data.filter((_,i)=>i%5===0||i===data.length-1).map((d,i)=>(
          <span key={i} className="text-slate-500 text-xs">{d.day}</span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════ */
function StatCard({ label, value, sub, up, icon, accent }) {
  return (
    <Card className="p-5 relative overflow-hidden">
      {/* accent bar */}
      <div className={`absolute top-0 left-0 w-full h-0.5 ${accent||"bg-amber-500"}`}/>
      <div className="flex items-start justify-between mb-3">
        <span className="text-amber-500 opacity-80"><Ic d={icon} size={18}/></span>
        <span className={`text-xs font-bold px-2 py-0.5 ${up!==undefined?(up?"bg-emerald-500/20 text-emerald-400":"bg-red-500/20 text-red-400"):"bg-slate-600 text-slate-300"}`}>
          {sub}
        </span>
      </div>
      <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold mb-1">{label}</p>
      <p className="text-white text-xl font-black" style={{fontFamily:"Georgia,serif"}}>{value}</p>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════
   STOCK ROW
══════════════════════════════════════════════════════ */
function StockRow({ s, spark, onSelect, selected }) {
  const up = s.chg >= 0;
  const isSelected = selected?.sym === s.sym;
  return (
    <div onClick={()=>onSelect(s)}
      className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all duration-150 border-b border-slate-600/30
        ${isSelected?"bg-amber-500/10 border-l-2 border-l-amber-500":"hover:bg-slate-600/40"}`}>
      <div className={`w-9 h-9 flex items-center justify-center shrink-0 font-black text-sm
        ${isSelected?"bg-amber-500 text-slate-900":"bg-slate-600 text-amber-400"}`}>
        {s.sym[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-bold">{s.sym}</p>
        <p className="text-slate-400 text-xs truncate">{s.name}</p>
      </div>
      <Sparkline data={spark} up={up} w={70} h={26}/>
      <div className="text-right min-w-[80px]">
        <p className="text-white text-xs font-bold">${fmt$(s.price)}</p>
        <p className={`text-xs font-semibold ${up?"text-emerald-400":"text-red-400"}`}>
          {up?"+":""}{fmt$(s.chg)} ({up?"+":""}{Number(s.pct).toFixed(2)}%)
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   BUY / SELL PANEL
══════════════════════════════════════════════════════ */
function BuySellPanel({ selected, stocks, onTrade }) {
  const [tab, setTab] = useState("BUY");
  const [qty, setQty]   = useState(1);
  const [sym, setSym]   = useState(selected?.sym||"AAPL");

  useEffect(()=>{ if(selected?.sym) setSym(selected.sym); },[selected]);

  const stock = stocks.find(s=>s.sym===sym) || selected || {};
  const price = stock.price || 0;
  const total = (qty*price).toFixed(2);

  return (
    <Card>
      <CardHead icon={<Ic d={tab==="BUY"?I.buy:I.sell} size={16}/>} title="Place Order"/>
      <div className="p-5 flex flex-col gap-4">
        {/* BUY / SELL tabs */}
        <div className="flex rounded-none overflow-hidden border border-slate-500/40">
          {["BUY","SELL"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`flex-1 py-2.5 text-xs font-black tracking-widest uppercase transition-all
                ${tab===t
                  ? t==="BUY"?"bg-emerald-500 text-slate-900":"bg-red-500 text-white"
                  : "bg-slate-600 text-slate-400 hover:text-white"}`}>
              {t==="BUY"?"▲ Buy":"▼ Sell"}
            </button>
          ))}
        </div>

        {/* Stock select */}
        <div>
          <label className="text-slate-400 text-xs tracking-widest uppercase block mb-2">Stock</label>
          <select value={sym} onChange={e=>setSym(e.target.value)}
            className="w-full bg-slate-600 border border-slate-500/50 text-white text-xs px-3 py-2.5 outline-none appearance-none cursor-pointer">
            {stocks.map(s=>(
              <option key={s.sym} value={s.sym}>{s.sym} — ${fmt$(s.price)}</option>
            ))}
          </select>
        </div>

        {/* Live price display */}
        <div className="bg-slate-600/50 border border-slate-500/30 px-4 py-3 flex justify-between items-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider">Market Price</span>
          <span className="text-amber-400 font-black text-lg" style={{fontFamily:"Georgia,serif"}}>${fmt$(price)}</span>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-slate-400 text-xs tracking-widest uppercase block mb-2">Quantity</label>
          <div className="flex items-center border border-slate-500/40 overflow-hidden">
            <button onClick={()=>setQty(q=>Math.max(1,q-1))}
              className="w-10 h-10 bg-slate-600 text-white font-black text-lg hover:bg-slate-500 transition-colors shrink-0">−</button>
            <input type="number" value={qty} min="1"
              onChange={e=>setQty(Math.max(1,+e.target.value))}
              className="flex-1 bg-slate-700 text-white text-center text-sm py-2 outline-none h-10"/>
            <button onClick={()=>setQty(q=>q+1)}
              className="w-10 h-10 bg-slate-600 text-white font-black text-lg hover:bg-slate-500 transition-colors shrink-0">+</button>
          </div>
        </div>

        {/* Total */}
        <div className="bg-slate-600/40 border border-slate-500/30 px-4 py-3 flex justify-between items-center">
          <span className="text-slate-400 text-xs uppercase tracking-wider">Estimated Total</span>
          <span className="text-white font-black text-base">${Number(total).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
        </div>

        <button
          onClick={()=>onTrade&&onTrade({sym,type:tab,qty,price,total:+total})}
          className={`w-full py-3 text-xs font-black tracking-widest uppercase transition-colors
            ${tab==="BUY"?"bg-emerald-500 hover:bg-emerald-400 text-slate-900":"bg-red-500 hover:bg-red-400 text-white"}`}>
          {tab==="BUY"?"▲ Confirm Buy Order":"▼ Confirm Sell Order"}
        </button>
        <p className="text-slate-500 text-xs text-center">Virtual wallet · No real money involved</p>
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════
   VIRTUAL WALLET
══════════════════════════════════════════════════════ */
function VirtualWallet({ stocks }) {
  const holdings = [
    { sym:"AAPL", qty:10, avg:187.20 },
    { sym:"NVDA", qty:5,  avg:860.00 },
    { sym:"MSFT", qty:3,  avg:413.50 },
  ];
  const cash=28430.10;
  const enriched = holdings.map(h=>{
    const live=stocks.find(s=>s.sym===h.sym);
    const curr=live?.price||FALLBACK[h.sym]?.price||h.avg;
    const pnl=h.qty*(curr-h.avg);
    return {...h,curr,pnl};
  });
  const invested=enriched.reduce((a,h)=>a+h.qty*h.curr,0);
  const totalPnl=enriched.reduce((a,h)=>a+h.pnl,0);
  const total=cash+invested;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500"/>
          <p className="text-slate-400 text-xs tracking-widest uppercase mb-1">Total Value</p>
          <p className="text-white text-2xl font-black" style={{fontFamily:"Georgia,serif"}}>${total.toLocaleString(undefined,{maximumFractionDigits:0})}</p>
        </Card>
        <Card className="p-4 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-0.5 ${totalPnl>=0?"bg-emerald-500":"bg-red-500"}`}/>
          <p className="text-slate-400 text-xs tracking-widest uppercase mb-1">Unrealized P&L</p>
          <p className={`text-2xl font-black ${totalPnl>=0?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"Georgia,serif"}}>
            {totalPnl>=0?"+":"-"}${Math.abs(totalPnl).toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-slate-400 text-xs tracking-widest uppercase mb-1">Cash Available</p>
          <p className="text-white text-xl font-bold">${cash.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
        </Card>
        <Card className="p-4">
          <p className="text-slate-400 text-xs tracking-widest uppercase mb-1">Invested</p>
          <p className="text-white text-xl font-bold">${invested.toLocaleString(undefined,{maximumFractionDigits:0})}</p>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <CardHead icon={<Ic d={I.wallet} size={16}/>} title="Current Holdings"/>
        <div className="divide-y divide-slate-600/40">
          {enriched.map((h,i)=>(
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-600/30 transition-colors">
              <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <span className="text-amber-400 font-black text-sm">{h.sym[0]}</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-bold">{h.sym}</p>
                <p className="text-slate-400 text-xs">{h.qty} shares · avg ${fmt$(h.avg)}</p>
              </div>
              <div className="text-center">
                <p className="text-white text-xs font-bold">${fmt$(h.curr)}</p>
                <p className="text-slate-400 text-xs">Current</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-bold">${fmt$(h.qty*h.curr)}</p>
                <p className={`text-xs font-bold ${h.pnl>=0?"text-emerald-400":"text-red-400"}`}>
                  {h.pnl>=0?"+":"-"}${Math.abs(h.pnl).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TRANSACTION HISTORY
══════════════════════════════════════════════════════ */
function TransactionHistory() {
  const [filter,setFilter]=useState("ALL");
  const filtered=filter==="ALL"?TRADES_DATA:TRADES_DATA.filter(t=>t.type===filter);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-black text-lg" style={{fontFamily:"Georgia,serif"}}>Transaction History</h2>
        <div className="flex gap-2">
          {["ALL","BUY","SELL"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-3 py-1 text-xs font-bold tracking-widest uppercase transition-colors
                ${filter===f?"bg-amber-500 text-slate-900":"bg-slate-700 text-slate-400 hover:text-white border border-slate-500/40"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-500/40">
                {["Date","Time","Stock","Type","Qty","Price","Total","P&L"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold tracking-widest uppercase text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/30">
              {filtered.map(t=>{
                const pnl=(Math.random()-0.4)*200;
                return (
                  <tr key={t.id} className="hover:bg-slate-600/20 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{t.date}</td>
                    <td className="px-4 py-3 text-slate-400">{t.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-slate-600 flex items-center justify-center text-amber-400 font-black text-xs">{t.sym[0]}</span>
                        <span className="text-white font-bold">{t.sym}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-black tracking-wider ${t.type==="BUY"?"bg-emerald-500/20 text-emerald-400":"bg-red-500/20 text-red-400"}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{t.qty}</td>
                    <td className="px-4 py-3 text-slate-300">${fmt$(t.price)}</td>
                    <td className="px-4 py-3 text-white font-bold">${fmt$(t.total)}</td>
                    <td className={`px-4 py-3 font-bold ${pnl>=0?"text-emerald-400":"text-red-400"}`}>
                      {pnl>=0?"+":"-"}${Math.abs(pnl).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LEADERBOARD
══════════════════════════════════════════════════════ */
function Leaderboard() {
  const medals=["🥇","🥈","🥉"];
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-white font-black text-lg" style={{fontFamily:"Georgia,serif"}}>Leaderboard</h2>
      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {LEADERBOARD_DATA.slice(0,3).map((p,i)=>(
          <Card key={i} className={`p-4 text-center relative overflow-hidden ${i===0?"border-amber-500/60":""}`}>
            <div className={`absolute top-0 left-0 w-full h-0.5 ${i===0?"bg-yellow-400":i===1?"bg-slate-400":"bg-amber-700"}`}/>
            <div className="text-2xl mb-2">{medals[i]}</div>
            <div className="w-10 h-10 bg-slate-600 flex items-center justify-center mx-auto mb-2">
              <span className="text-amber-400 font-black">{p.name[0]}</span>
            </div>
            <p className={`text-xs font-bold ${p.isMe?"text-amber-400":"text-white"}`}>{p.name}</p>
            <p className="text-emerald-400 text-sm font-black mt-1">{p.pnl}</p>
            <p className="text-slate-400 text-xs">{p.ret}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="divide-y divide-slate-600/40">
          {LEADERBOARD_DATA.map((p,i)=>(
            <div key={i}
              className={`flex items-center gap-4 px-5 py-3.5 transition-colors
                ${p.isMe?"bg-amber-500/10 border-l-2 border-l-amber-500":"hover:bg-slate-600/30"}`}>
              <span className={`w-6 text-center text-xs font-black
                ${p.rank===1?"text-yellow-400":p.rank===2?"text-slate-300":p.rank===3?"text-amber-600":"text-slate-500"}`}>
                #{p.rank}
              </span>
              <div className="w-8 h-8 bg-slate-600 flex items-center justify-center">
                <span className="text-amber-400 text-xs font-black">{p.name[0]}</span>
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${p.isMe?"text-amber-400":"text-white"}`}>{p.name}</p>
                <p className="text-slate-500 text-xs">{p.trades} trades</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 text-xs font-bold">{p.pnl}</p>
                <p className="text-slate-400 text-xs">{p.ret}</p>
              </div>
              {p.isMe&&<span className="bg-amber-500 text-slate-900 text-xs font-black px-1.5 py-0.5">YOU</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   WATCHLIST VIEW
══════════════════════════════════════════════════════ */
function WatchlistView({ stocks, onSelect }) {
  const [wlist, setWlist]=useState(["NFLX","AMD","INTC","DIS","PYPL"]);
  const [input, setInput]=useState("");
  const watched = stocks.filter(s=>wlist.includes(s.sym));
  const [sparks] = useState(()=>wlist.reduce((a,sym)=>({...a,[sym]:genSparkline(100)}),{}));

  const add=()=>{
    const s=input.trim().toUpperCase();
    if(s&&!wlist.includes(s)){setWlist(w=>[...w,s]);} setInput("");
  };
  const remove=(sym)=>setWlist(w=>w.filter(s=>s!==sym));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-black text-lg" style={{fontFamily:"Georgia,serif"}}>Watchlist</h2>
        <div className="flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&add()}
            placeholder="Add ticker…"
            className="bg-slate-700 border border-slate-500/50 text-white text-xs px-3 py-2 outline-none w-32 placeholder-slate-500"/>
          <button onClick={add} className="bg-amber-500 text-slate-900 px-3 py-2 text-xs font-black hover:bg-amber-400 transition-colors">
            + Add
          </button>
        </div>
      </div>
      <Card>
        {watched.length===0&&wlist.length>0&&(
          <div className="p-8 text-center text-slate-400 text-sm">
            Stocks in your watchlist will appear here once data loads.
          </div>
        )}
        <div className="divide-y divide-slate-600/40">
          {wlist.map(sym=>{
            const s=stocks.find(x=>x.sym===sym);
            const up=(s?.chg||0)>=0;
            return (
              <div key={sym} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-600/30 transition-colors group">
                <div className="w-9 h-9 bg-slate-600 flex items-center justify-center cursor-pointer" onClick={()=>s&&onSelect(s)}>
                  <span className="text-amber-400 font-black text-sm">{sym[0]}</span>
                </div>
                <div className="flex-1 cursor-pointer" onClick={()=>s&&onSelect(s)}>
                  <p className="text-white text-xs font-bold">{sym}</p>
                  <p className="text-slate-400 text-xs">{s?.name||"—"}</p>
                </div>
                <Sparkline data={sparks[sym]||[]} up={up} w={70} h={26}/>
                <div className="text-right w-24">
                  <p className="text-white text-xs font-bold">{s?`$${fmt$(s.price)}`:"Loading…"}</p>
                  {s&&<p className={`text-xs font-semibold ${up?"text-emerald-400":"text-red-400"}`}>
                    {up?"+":""}{fmt$(s.chg)} ({up?"+":""}{Number(s.pct).toFixed(2)}%)
                  </p>}
                </div>
                <button onClick={()=>remove(sym)}
                  className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-1">
                  <Ic d={I.trash} size={14}/>
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AI CHATBOT
══════════════════════════════════════════════════════ */
function AIChatbot() {
  const [msgs,setMsgs]=useState([
    {role:"ai",text:"Hi! I'm your AI trading assistant 🤖 Ask me about any stock, strategy, or how to interpret your portfolio data."}
  ]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const endRef=useRef(null);

  const send=()=>{
    if(!input.trim()) return;
    const userMsg={role:"user",text:input};
    setMsgs(m=>[...m,userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(()=>{
      const ai={role:"ai",text:AI_RESPONSES[Math.floor(Math.random()*AI_RESPONSES.length)]};
      setMsgs(m=>[...m,ai]);
      setTyping(false);
      setTimeout(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),100);
    },1000+Math.random()*800);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-white font-black text-lg" style={{fontFamily:"Georgia,serif"}}>AI Trading Assistant</h2>
      <Card className="flex flex-col" style={{height:480}}>
        <CardHead icon={<Ic d={I.bot} size={16}/>} title="Ask Anything"
          action={<span className="text-emerald-400 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Online
          </span>}/>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {msgs.map((m,i)=>(
            <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
              {m.role==="ai"&&(
                <div className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                  <span className="text-amber-400 text-xs font-black">AI</span>
                </div>
              )}
              <div className={`max-w-sm px-4 py-2.5 text-xs leading-relaxed
                ${m.role==="ai"
                  ?"bg-slate-600/80 text-slate-200 border-l-2 border-amber-500"
                  :"bg-amber-500/20 text-amber-100 border-r-2 border-amber-500"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {typing&&(
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="text-amber-400 text-xs font-black">AI</span>
              </div>
              <div className="bg-slate-600/80 px-4 py-2.5 flex gap-1 items-center">
                {[0,1,2].map(i=>(
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    style={{animation:`bounce 1s ${i*0.2}s infinite`}}/>
                ))}
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>
        <div className="flex border-t border-slate-500/40">
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&send()}
            placeholder="Ask about stocks, strategies, P&L…"
            className="flex-1 bg-slate-700 text-white text-xs px-4 py-3.5 outline-none placeholder-slate-500"/>
          <button onClick={send}
            className="px-5 bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors font-bold">
            <Ic d={I.send} size={15} stroke="#0f172a" sw={2}/>
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMMUNITY CHAT
══════════════════════════════════════════════════════ */
function CommunityChat() {
  const [msgs,setMsgs]=useState(COMMUNITY_MSGS);
  const [input,setInput]=useState("");
  const colors=["text-amber-400","text-emerald-400","text-blue-400","text-purple-400","text-pink-400"];
  const send=()=>{
    if(!input.trim()) return;
    setMsgs(m=>[...m,{user:"You",msg:input,time:"just now"}]);
    setInput("");
  };
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-white font-black text-lg" style={{fontFamily:"Georgia,serif"}}>Community Chat</h2>
      <Card className="flex flex-col" style={{height:480}}>
        <CardHead icon={<Ic d={I.chat} size={16}/>} title="Traders Lounge"
          action={<span className="text-emerald-400 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>24 online
          </span>}/>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {msgs.map((m,i)=>(
            <div key={i} className={`flex flex-col gap-1 ${m.user==="You"?"items-end":""}`}>
              <div className={`flex items-center gap-2 ${m.user==="You"?"flex-row-reverse":""}`}>
                <div className="w-6 h-6 bg-slate-600 flex items-center justify-center text-xs font-black shrink-0"
                  style={{color:colors[i%colors.length]}}>
                  {m.user[0]}
                </div>
                <span className={`text-xs font-bold ${m.user==="You"?"text-amber-400":colors[i%colors.length]}`}>{m.user}</span>
                <span className="text-slate-600 text-xs">{m.time}</span>
              </div>
              <div className={`max-w-xs px-3 py-2 text-xs leading-relaxed
                ${m.user==="You"?"bg-amber-500/20 text-amber-100":"bg-slate-600/60 text-slate-300"}`}>
                {m.msg}
              </div>
            </div>
          ))}
        </div>
        <div className="flex border-t border-slate-500/40">
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&send()}
            placeholder="Share your thoughts…"
            className="flex-1 bg-slate-700 text-white text-xs px-4 py-3.5 outline-none placeholder-slate-500"/>
          <button onClick={send}
            className="px-5 bg-slate-600 text-slate-300 hover:bg-slate-500 transition-colors">
            <Ic d={I.send} size={15}/>
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SIDEBAR NAV
══════════════════════════════════════════════════════ */
const NAV=[
  {key:"dashboard",  label:"Dashboard",     icon:I.home    },
  {key:"stocks",     label:"Live Stocks",   icon:I.stocks  },
  {key:"buysell",    label:"Buy / Sell",    icon:I.buy     },
  {key:"wallet",     label:"Wallet",        icon:I.wallet  },
  {key:"watchlist",  label:"Watchlist",     icon:I.watch   },
  {key:"history",    label:"Transactions",  icon:I.history },
  {key:"leaderboard",label:"Leaderboard",   icon:I.leader  },
  {key:"ai",         label:"AI Assistant",  icon:I.bot     },
  {key:"community",  label:"Community",     icon:I.chat    },
];

function Sidebar({active,setActive,collapsed,setCollapsed}) {
  return (
    <aside className={`flex flex-col bg-slate-800 border-r border-slate-600/50 transition-all duration-300 shrink-0 ${collapsed?"w-16":"w-56"}`}
      style={{minHeight:"100vh",position:"sticky",top:0}}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-600/50">
        <div className="w-8 h-8 bg-amber-500 flex items-center justify-center shrink-0">
          <Ic d={I.trend} size={15} stroke="#0f172a" sw={2.5}/>
        </div>
        {!collapsed&&(
          <div className="flex-1">
            <p className="text-white font-black text-sm leading-tight" style={{fontFamily:"Georgia,serif"}}>PaperTrade</p>
            <p className="text-amber-500 text-xs tracking-widest uppercase font-semibold">AI</p>
          </div>
        )}
        <button onClick={()=>setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-amber-500 transition-colors ml-auto">
          <Ic d={collapsed?I.menu:I.close} size={15}/>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(item=>(
          <button key={item.key} onClick={()=>setActive(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150
              ${active===item.key
                ?"bg-amber-500/10 text-amber-400 border-r-2 border-amber-500"
                :"text-slate-400 hover:text-white hover:bg-slate-700/60"}`}>
            <span className="shrink-0">
              <Ic d={item.icon} size={15} stroke="currentColor" sw={active===item.key?2.2:1.7}/>
            </span>
            {!collapsed&&<span className="text-xs font-semibold tracking-wide">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User badge */}
      {!collapsed&&(
        <div className="px-4 py-4 border-t border-slate-600/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 flex items-center justify-center font-black text-slate-900 text-xs">YO</div>
            <div>
              <p className="text-white text-xs font-bold">You</p>
              <p className="text-amber-500 text-xs">Rank #4</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ══════════════════════════════════════════════════════
   TOP BAR
══════════════════════════════════════════════════════ */
function TopBar({pageTitle,stocks,loading,onRefresh}) {
  return (
    <header className="bg-slate-800 border-b border-slate-600/50 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
      <div className="flex-1">
        <h1 className="text-white font-black text-base" style={{fontFamily:"Georgia,serif"}}>{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${loading?"text-amber-400":"text-emerald-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${loading?"bg-amber-400 animate-pulse":"bg-emerald-400 animate-pulse"}`}/>
          {loading?"Fetching…":"Live"}
        </span>
        <button onClick={onRefresh}
          className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 text-xs font-semibold transition-colors border border-slate-600 px-2.5 py-1.5">
          <Ic d={I.refresh} size={12}/> Refresh
        </button>
        <button className="relative text-slate-400 hover:text-amber-400 transition-colors">
          <Ic d={I.bell} size={17}/>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white flex items-center justify-center" style={{fontSize:8}}>3</span>
        </button>
        <span className="text-slate-500 text-xs hidden lg:block">
          {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}
        </span>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════
   DASHBOARD HOME VIEW
══════════════════════════════════════════════════════ */
function DashboardHome({stocks,loading,portfolioData,selectedStock,setSelectedStock,sparks,onTrade}) {
  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Portfolio Value" value="$74,830"  sub="↑ 8.6% all time" up icon={I.portf}   accent="bg-amber-500"/>
        <StatCard label="Today's P&L"     value="+$1,240"  sub="↑ 1.68% today"   up icon={I.trend}   accent="bg-emerald-500"/>
        <StatCard label="Cash Balance"    value="$28,430"  sub="37% of total"     up icon={I.wallet}  accent="bg-blue-500"/>
        <StatCard label="Open Positions"  value="3 Stocks" sub="AAPL · NVDA · MSFT" icon={I.stocks}  accent="bg-purple-500"/>
      </div>

      {/* Chart + Buy/Sell */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-5">
          <PortfolioChart data={portfolioData}/>
        </Card>
        <BuySellPanel selected={selectedStock} stocks={stocks} onTrade={onTrade}/>
      </div>

      {/* Stocks + Watchlist preview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHead icon={<Ic d={I.stocks} size={16}/>} title="Live Stocks"
            badge="Live"
            action={<span className="text-emerald-400 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Auto-refresh
            </span>}/>
          {loading?(
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/>
              <span className="text-slate-400 text-xs">Fetching live prices…</span>
            </div>
          ):(
            <div className="divide-y divide-slate-600/30">
              {stocks.slice(0,6).map(s=>(
                <StockRow key={s.sym} s={s} spark={sparks[s.sym]} onSelect={setSelectedStock} selected={selectedStock}/>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <CardHead icon={<Ic d={I.leader} size={16}/>} title="Top Traders"/>
          <div className="divide-y divide-slate-600/40">
            {LEADERBOARD_DATA.slice(0,4).map((p,i)=>(
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${p.isMe?"bg-amber-500/10":""}`}>
                <span className={`text-xs font-black w-5 ${["text-yellow-400","text-slate-300","text-amber-600","text-slate-500"][i]}`}>
                  #{p.rank}
                </span>
                <div className="w-7 h-7 bg-slate-600 flex items-center justify-center">
                  <span className="text-amber-400 text-xs font-black">{p.name[0]}</span>
                </div>
                <span className={`text-xs font-bold flex-1 ${p.isMe?"text-amber-400":"text-white"}`}>{p.name}</span>
                <span className="text-emerald-400 text-xs font-bold">{p.pnl}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LIVE STOCKS VIEW
══════════════════════════════════════════════════════ */
function LiveStocksView({stocks,loading,sparks,onSelect,selected}) {
  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-black text-lg" style={{fontFamily:"Georgia,serif"}}>Live Market Prices</h2>
        <span className="text-emerald-400 text-xs flex items-center gap-1.5 border border-emerald-500/30 px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Real-time via Alpha Vantage
        </span>
      </div>

      {/* Gain/Loss summary */}
      <div className="grid grid-cols-2 gap-4">
        {["Gainers","Losers"].map(type=>{
          const list=stocks.filter(s=>(type==="Gainers"?s.chg>=0:s.chg<0))
            .sort((a,b)=>type==="Gainers"?b.pct-a.pct:a.pct-b.pct).slice(0,3);
          return (
            <Card key={type} className="p-4">
              <p className={`text-xs font-black tracking-widest uppercase mb-3 ${type==="Gainers"?"text-emerald-400":"text-red-400"}`}>
                {type==="Gainers"?"▲ Top Gainers":"▼ Top Losers"}
              </p>
              <div className="flex flex-col gap-2">
                {list.map((s,i)=>(
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-white text-xs font-bold">{s.sym}</span>
                    <span className={`text-xs font-bold ${type==="Gainers"?"text-emerald-400":"text-red-400"}`}>
                      {s.pct>0?"+":""}{Number(s.pct).toFixed(2)}%
                    </span>
                  </div>
                ))}
                {list.length===0&&<span className="text-slate-500 text-xs">Loading…</span>}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHead icon={<Ic d={I.stocks} size={16}/>} title="All Stocks" badge="Live"/>
        {loading?(
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/>
            <span className="text-slate-400 text-sm">Fetching from Alpha Vantage…</span>
          </div>
        ):(
          <div className="divide-y divide-slate-600/30">
            {stocks.map(s=>(
              <StockRow key={s.sym} s={s} spark={sparks[s.sym]} onSelect={onSelect} selected={selected}/>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT DASHBOARD
══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [collapsed,   setCollapsed]   = useState(false);
  const [activeNav,   setActiveNav]   = useState("dashboard");
  const [stocks,      setStocks]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedStock,setSelectedStock] = useState(null);
  const [sparks]      = useState(()=>SYMBOLS.reduce((a,{sym})=>({...a,[sym]:genSparkline(FALLBACK[sym]?.price||100)}),{}));
  const [portfolioData]=useState(()=>genPortfolioHistory());
  const [trades, setTrades] = useState(TRADES_DATA);

  /* ── Fetch Alpha Vantage (sequential to avoid rate limit) ── */
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    const results=[];
    for (const {sym,name} of SYMBOLS) {
      try {
        const res = await fetch(AV(sym));
        const json = await res.json();
        const q = json["Global Quote"];
        if(q && q["05. price"]) {
          results.push({
            sym, name,
            price: +parseFloat(q["05. price"]).toFixed(2),
            chg:   +parseFloat(q["09. change"]).toFixed(2),
            pct:   +parseFloat(q["10. change percent"].replace("%","")).toFixed(2),
            open:  parseFloat(q["02. open"]).toFixed(2),
            high:  parseFloat(q["03. high"]).toFixed(2),
            low:   parseFloat(q["04. low"]).toFixed(2),
            vol:   parseInt(q["06. volume"]).toLocaleString(),
          });
        } else {
          // Fallback
          const fb=FALLBACK[sym]||{price:100,chg:0,pct:0};
          results.push({sym,name,...fb,open:fb.price,high:fb.price,low:fb.price,vol:"N/A"});
        }
        // Alpha Vantage free tier: ~5 calls/min — small delay
        await new Promise(r=>setTimeout(r,300));
      } catch {
        const fb=FALLBACK[sym]||{price:100,chg:0,pct:0};
        results.push({sym,name,...fb});
      }
    }
    setStocks(results);
    if(results.length) setSelectedStock(results[0]);
    setLoading(false);
  },[]);

  useEffect(()=>{ fetchStocks(); },[fetchStocks]);

  /* ── Handle trade ── */
  const onTrade = ({sym,type,qty,price,total}) => {
    const now=new Date();
    const newTrade={
      id: trades.length+1,
      sym, type, qty, price, total,
      time: now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),
      date: now.toLocaleDateString("en-US",{month:"short",day:"numeric"}),
    };
    setTrades(t=>[newTrade,...t]);
    alert(`✅ ${type} order placed!\n${qty} × ${sym} @ $${price.toFixed(2)}\nTotal: $${total.toFixed(2)}`);
  };

  /* ── Page routing ── */
  const PAGE_TITLES={
    dashboard:"Trading Dashboard", stocks:"Live Market",
    buysell:"Buy / Sell", wallet:"Virtual Wallet",
    watchlist:"Watchlist", history:"Transaction History",
    leaderboard:"Leaderboard", ai:"AI Assistant",
    community:"Community Chat",
  };

  const renderView = () => {
    switch(activeNav) {
      case "dashboard":
        return <DashboardHome stocks={stocks} loading={loading} portfolioData={portfolioData}
          selectedStock={selectedStock} setSelectedStock={setSelectedStock} sparks={sparks} onTrade={onTrade}/>;
      case "stocks":
        return <LiveStocksView stocks={stocks} loading={loading} sparks={sparks}
          onSelect={setSelectedStock} selected={selectedStock}/>;
      case "buysell":
        return (
          <div className="p-5 max-w-md">
            <h2 className="text-white font-black text-lg mb-4" style={{fontFamily:"Georgia,serif"}}>Place an Order</h2>
            <BuySellPanel selected={selectedStock} stocks={stocks} onTrade={onTrade}/>
          </div>
        );
      case "wallet":
        return <div className="p-5"><VirtualWallet stocks={stocks}/></div>;
      case "watchlist":
        return <div className="p-5"><WatchlistView stocks={stocks} onSelect={s=>{setSelectedStock(s);setActiveNav("buysell");}}/></div>;
      case "history":
        return <div className="p-5"><TransactionHistory/></div>;
      case "leaderboard":
        return <div className="p-5"><Leaderboard/></div>;
      case "ai":
        return <div className="p-5"><AIChatbot/></div>;
      case "community":
        return <div className="p-5"><CommunityChat/></div>;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#1e293b;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#1e293b;}
        ::-webkit-scrollbar-thumb{background:#475569;border-radius:2px;}
        select option{background:#334155;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
      `}</style>

      <div className="flex min-h-screen bg-slate-800 text-white" style={{fontFamily:"'DM Sans',system-ui,sans-serif"}}>
        <Sidebar active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed}/>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar
            pageTitle={PAGE_TITLES[activeNav]}
            stocks={stocks} loading={loading}
            onRefresh={fetchStocks}/>

          <main className="flex-1 overflow-y-auto" key={activeNav}
            style={{animation:"fadeUp .35s ease both"}}>
            {renderView()}
          </main>
        </div>
      </div>
    </>
  );
}