import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAlerts } from "../context/AlertContext";
import { Ic, I, ThemeToggle, useT } from "./UI";

const NAV = [
  { to: "/dashboard",   label: "Dashboard",    icon: I.home     },
  { to: "/stocks",      label: "Live Stocks",  icon: I.stocks   },
  { to: "/trade",       label: "Buy / Sell",   icon: I.buy      },
  { to: "/portfolio",   label: "Portfolio",    icon: I.portf    },
  { to: "/watchlist",   label: "Watchlist",    icon: I.star     },
  { to: "/alerts",      label: "Price Alerts", icon: I.bell     },
  { to: "/leaderboard", label: "Leaderboard",  icon: I.leader   },
  { to: "/ai",          label: "AI Assistant", icon: I.bot      },
  { to: "/community",   label: "Community",    icon: I.chat     },
  { to: "/news",        label: "News Feed",    icon: I.news     },
  { to: "/profile",     label: "Profile",      icon: I.settings },
];

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const { alerts } = useAlerts();
  const activeAlerts = alerts.filter((a) => !a.triggered).length;

  return (
    <aside
      className={`flex flex-col ${t.sidebar} border-r transition-all duration-300 shrink-0 ${collapsed ? "w-[68px]" : "w-60"}`}
      style={{ minHeight: "100vh", position: "sticky", top: 0 }}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b ${t.divider}`}>
        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
          <Ic d={I.trend} size={16} stroke="#0f172a" sw={2.5} />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className={`${t.text} font-bold text-base leading-tight`}>PaperTrade</p>
            <p className="text-amber-500 text-xs font-medium">AI Simulator</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className={`${t.muted} hover:text-amber-500 transition-colors shrink-0 p-1 rounded-lg ${t.hover}`}>
          <Ic d={collapsed ? I.menu : I.close} size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto px-2 flex flex-col gap-0.5">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative
               ${isActive ? t.navActive : t.navIdle}`}>
            {({ isActive }) => (
              <>
                <span className="shrink-0">
                  <Ic d={item.icon} size={16} stroke="currentColor" sw={isActive ? 2.2 : 1.7} />
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {item.to === "/alerts" && activeAlerts > 0 && (
                  <span className={`${collapsed ? "absolute top-1 right-1" : "ml-auto"} w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center`}>
                    {activeAlerts}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User strip */}
      <div className={`border-t ${t.divider} p-3`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-900 text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`${t.text} text-xs font-semibold truncate`}>{user?.name}</p>
              <p className="text-amber-500 text-xs font-medium">
                ${Number(user?.virtualCash || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <button onClick={() => { logout(); navigate("/login"); }}
              title="Logout"
              className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
              <Ic d={I.logout} size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex justify-center text-slate-500 hover:text-red-400 transition-colors py-1">
            <Ic d={I.logout} size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}

export function Layout({ children, title, action }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const t = useT();

  return (
    <div className={`flex min-h-screen ${t.bg}`}
      style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`${t.header} border-b px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20`}>
          <h1 className={`${t.text} font-bold text-lg flex-1`}>{title}</h1>
          {action && <div>{action}</div>}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Live
            </span>
            <ThemeToggle />
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="text-amber-400 font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6" style={{ animation: "fadeUp .3s ease both" }}>
          {children}
        </main>
      </div>
    </div>
  );
}