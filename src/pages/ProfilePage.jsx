import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card, CardHead, Button, Input, AlertBanner, Ic, I, fmt$, useT, Badge, ThemeToggle } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const { dark } = useTheme();
  const t = useT();

  const [name,      setName]      = useState(user?.name || "");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState("");
  const [trades,    setTrades]    = useState([]);
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/trades?limit=100"),
      api.get("/portfolio"),
    ]).then(([tr, p]) => {
      setTrades(tr.data.trades || []);
      setPortfolio(p.data);
    }).catch(() => {});
  }, []);

  const save = async () => {
    if (!name.trim()) { setError("Name cannot be empty"); return; }
    setSaving(true);
    setError("");
    try {
      await api.put("/auth/me", { name });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const totalTrades = trades.length;
  const buyTrades   = trades.filter((tr) => tr.type === "BUY").length;
  const sellTrades  = trades.filter((tr) => tr.type === "SELL").length;
  const totalVolume = trades.reduce((s, tr) => s + tr.total, 0);
  const s           = portfolio?.summary || {};
  const totalReturn = (s.cashBalance || user?.virtualCash || 0) - 100000;
  const returnPct   = ((totalReturn / 100000) * 100).toFixed(2);

  const stats = [
    { label: "Starting Balance",  val: "$100,000",                  color: "text-slate-400" },
    { label: "Current Cash",      val: `$${Number(s.cashBalance || user?.virtualCash || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, color: "text-amber-500" },
    { label: "Portfolio Value",   val: `$${Number(s.totalPortfolioValue || user?.virtualCash || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, color: t.text },
    { label: "Total Return",      val: `${totalReturn >= 0 ? "+" : ""}$${fmt$(totalReturn)}`, color: totalReturn >= 0 ? "text-emerald-400" : "text-red-400" },
    { label: "Return %",          val: `${parseFloat(returnPct) >= 0 ? "+" : ""}${returnPct}%`, color: parseFloat(returnPct) >= 0 ? "text-emerald-400" : "text-red-400" },
    { label: "Total Trades",      val: totalTrades,   color: "text-blue-400"   },
    { label: "Buy Orders",        val: buyTrades,     color: "text-emerald-400"},
    { label: "Sell Orders",       val: sellTrades,    color: "text-red-400"    },
    { label: "Total Volume",      val: `$${fmt$(totalVolume)}`, color: "text-purple-400" },
    { label: "Open Positions",    val: portfolio?.holdings?.length || 0, color: "text-amber-400" },
  ];

  return (
    <Layout title="Profile & Settings">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">

        {/* Profile hero */}
        <Card className="p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center font-bold text-slate-900 text-3xl shadow-lg shadow-amber-500/30">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className={`${t.text} font-bold text-2xl`}>{user?.name}</h2>
              <p className={`${t.muted} text-sm`}>{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge color={parseFloat(returnPct) >= 0 ? "green" : "red"}>
                  {parseFloat(returnPct) >= 0 ? "▲" : "▼"} {Math.abs(returnPct)}% return
                </Badge>
                <Badge color="amber">{totalTrades} trades</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Display Name" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <AlertBanner type="error"   message={error}          onClose={() => setError("")} />
            <AlertBanner type="success" message={saved ? "Profile updated!" : ""} />
            <Button onClick={save} variant="primary" loading={saving} className="self-start">
              <Ic d={I.check} size={15} /> Save Changes
            </Button>
          </div>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHead icon={<Ic d={I.settings} size={16} />} title="Appearance" />
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className={`${t.text} font-medium`}>Theme</p>
              <p className={`${t.muted} text-xs mt-0.5`}>Currently {dark ? "Dark" : "Light"} mode</p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        {/* Trading stats */}
        <Card>
          <CardHead icon={<Ic d={I.chart} size={16} />} title="Trading Statistics" />
          <div className="grid grid-cols-2 md:grid-cols-5">
            {stats.map(({ label, val, color }, i) => (
              <div key={i} className={`px-4 py-4 border-b ${t.divider} ${i % 2 !== 0 ? `border-l ${t.divider}` : ""}`}>
                <p className={`${t.muted} text-xs mb-1`}>{label}</p>
                <p className={`${color} font-bold text-sm`}>{val}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Account info */}
        <Card>
          <CardHead icon={<Ic d={I.user} size={16} />} title="Account Info" />
          <div className="p-5 flex flex-col gap-0">
            {[
              ["User ID",      user?._id],
              ["Email",        user?.email],
              ["Member since", user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })
                : "—"],
            ].map(([label, val]) => (
              <div key={label} className={`flex items-center justify-between py-3 border-b last:border-0 ${t.divider}`}>
                <span className={`${t.muted} text-sm`}>{label}</span>
                <span className={`${t.text} text-sm font-medium font-mono`}>{val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="p-5">
          <p className={`${t.text} font-semibold mb-1`}>Danger Zone</p>
          <p className={`${t.muted} text-xs mb-4`}>These actions cannot be undone</p>
          <Button onClick={logout} variant="danger" size="sm">
            <Ic d={I.logout} size={15} /> Sign Out
          </Button>
        </Card>

      </div>
    </Layout>
  );
}