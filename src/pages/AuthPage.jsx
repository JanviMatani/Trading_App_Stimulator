import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Alert, Ic, I } from "../components/UI";

export default function AuthPage() {
  const [mode,     setMode]     = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
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

  return (
    <div className="min-h-screen bg-slate-800 flex text-white"
      style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        body{margin:0;background:#1e293b;}
      `}</style>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 border-r border-slate-700/50 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 flex items-center justify-center">
            <Ic d={I.trend} size={18} stroke="#0f172a" sw={2.5} />
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none"
              style={{ fontFamily: "Georgia,serif" }}>PaperTrade</p>
            <p className="text-amber-500 text-xs tracking-widest uppercase">AI Simulator</p>
          </div>
        </div>

        <div style={{ animation: "fadeUp .6s ease both" }}>
          <h2 className="text-white text-4xl font-black leading-tight mb-4"
            style={{ fontFamily: "Georgia,serif" }}>
            Practice Trading.<br />
            <span className="text-amber-500">Zero Risk.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Trade real stocks with $100,000 virtual cash. Track your portfolio,
            compete on the leaderboard, and learn with our AI assistant.
          </p>
          {[
            "Real-time stock prices via Alpha Vantage",
            "Virtual wallet with actual debit/credit logic",
            "AI-powered trading assistant",
            "Live community chat & leaderboard",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <span className="w-5 h-5 bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Ic d={I.check} size={12} stroke="#f59e0b" sw={2.5} />
              </span>
              <span className="text-slate-300 text-sm">{f}</span>
            </div>
          ))}
        </div>

        <p className="text-slate-600 text-xs">© 2024 PaperTrade AI · Paper money only</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md" style={{ animation: "fadeUp .5s ease both" }}>
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-amber-500 flex items-center justify-center">
              <Ic d={I.trend} size={16} stroke="#0f172a" sw={2.5} />
            </div>
            <p className="text-white font-black text-lg" style={{ fontFamily: "Georgia,serif" }}>
              PaperTrade AI
            </p>
          </div>

          <h3 className="text-white text-2xl font-black mb-1" style={{ fontFamily: "Georgia,serif" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h3>
          <p className="text-slate-400 text-sm mb-8">
            {mode === "login" ? "Sign in to your trading account" : "Start with $100,000 virtual cash"}
          </p>

          <Alert type="error" message={error} onClose={() => setError("")} />

          <form onSubmit={submit} className="flex flex-col gap-4 mt-4">
            {mode === "register" && (
              <Input label="Full Name" type="text" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <Input label="Email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password"
              placeholder={mode === "register" ? "Min 6 characters" : "Your password"}
              value={password} onChange={(e) => setPassword(e.target.value)} required />

            <Button type="submit" variant="primary" loading={loading} className="w-full mt-2 py-3">
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="text-amber-400 hover:text-amber-300 font-bold ml-2 transition-colors">
                {mode === "login" ? "Register free" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}