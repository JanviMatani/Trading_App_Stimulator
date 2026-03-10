import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Ic, I } from "./UI";

const NAV = [
  { to: "/dashboard",   label: "Dashboard",    icon: I.home   },
  { to: "/stocks",      label: "Live Stocks",  icon: I.stocks },
  { to: "/trade",       label: "Buy / Sell",   icon: I.buy    },
  { to: "/portfolio",   label: "Portfolio",    icon: I.portf  },
  { to: "/leaderboard", label: "Leaderboard",  icon: I.leader },
  { to: "/ai",          label: "AI Assistant", icon: I.bot    },
  { to: "/community",   label: "Community",    icon: I.chat   },
  { to: "/news",        label: "News Feed",    icon: I.news   },
];

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside className={`flex flex-col bg-slate-800 border-r border-slate-600/50 transition-all duration-300 shrink-0 ${collapsed ? "w-16" : "w-56"}`}
      style={{ minHeight: "100vh", position: "sticky", top: 0 }}>
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-600/50">
        <div className="w-8 h-8 bg-amber-500 flex items-center justify-center shrink-0">
          <Ic d={I.trend} size={15} stroke="#0f172a" sw={2.5} />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-tight" style={{ fontFamily: "Georgia,serif" }}>PaperTrade</p>
            <p className="text-amber-500 text-xs tracking-widest uppercase font-semibold">AI Simulator</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-amber-500 transition-colors ml-auto shrink-0">
          <Ic d={collapsed ? I.menu : I.close} size={15} />
        </button>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 transition-all duration-150 ${isActive
                ? "bg-amber-500/10 text-amber-400 border-r-2 border-amber-500"
                : "text-slate-400 hover:text-white hover:bg-slate-700/60"}`}>
            {({ isActive }) => (
              <>
                <span className="shrink-0"><Ic d={item.icon} size={15} stroke="currentColor" sw={isActive ? 2.2 : 1.7} /></span>
                {!collapsed && <span className="text-xs font-semibold tracking-wide">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-600/50 px-4 py-4">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 flex items-center justify-center font-black text-slate-900 text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs">${Number(user?.virtualCash || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} cash</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
              <Ic d={I.logout} size={14} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-slate-500 hover:text-red-400 transition-colors">
            <Ic d={I.logout} size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}

export function Layout({ children, title }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-800 text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-slate-800 border-b border-slate-600/50 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
          <h1 className="text-white font-black text-base flex-1" style={{ fontFamily: "Georgia,serif" }}>{title}</h1>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
            </span>
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="text-amber-400 font-black text-xs">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5" style={{ animation: "fadeUp .35s ease both" }}>
          {children}
        </main>
      </div>
    </div>
  );
}