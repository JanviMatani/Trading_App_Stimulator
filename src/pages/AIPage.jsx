import { useState, useRef, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card, CardHead, Spinner, Ic, I } from "../components/UI";
import api from "../utils/api";

const SUGGESTIONS = [
  "Should I buy NVDA right now?",
  "What is a good diversification strategy?",
  "Explain stop-loss orders",
  "How do I read a stock's P/E ratio?",
  "What's the difference between BUY and SELL orders?",
  "How do I manage risk in paper trading?",
];

const FALLBACKS = [
  "Based on market momentum, always consider diversifying across sectors to reduce risk.",
  "A good rule of thumb: never invest more than 5-10% of your portfolio in a single stock.",
  "Paper trading is perfect for testing strategies risk-free. Try different entry/exit points!",
  "Technical analysis combined with fundamental analysis gives a stronger market view.",
  "Even professional traders lose on 40% of trades. What matters is your risk/reward ratio.",
];

export default function AIPage() {
  const [msgs,    setMsgs]    = useState([
    { role: "assistant", text: "Hi! I'm your AI trading assistant 🤖 Ask me about stocks, strategies, risk management, or how to read your portfolio data." }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post("/ai/chat", {
        message: msg,
        history: msgs.slice(-6).map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        })),
      });
      setMsgs((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch {
      setMsgs((m) => [...m, {
        role: "assistant",
        text: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Assistant">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className="bg-slate-700/40 border border-amber-500/20 px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <span className="text-amber-400 font-black text-xs">AI</span>
          </div>
          <div>
            <p className="text-white text-xs font-bold">PaperTrade AI Assistant</p>
            <p className="text-slate-400 text-xs">Ask about stocks, strategy, risk management</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Online
          </span>
        </div>

        <Card className="flex flex-col" style={{ height: 480 }}>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-amber-400 text-xs font-black">AI</span>
                  </div>
                )}
                <div className={`max-w-lg px-4 py-3 text-sm leading-relaxed
                  ${m.role === "assistant"
                    ? "bg-slate-600/80 text-slate-200 border-l-2 border-amber-500"
                    : "bg-amber-500/20 text-amber-100 border-r-2 border-amber-500"}`}>
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 bg-amber-500 flex items-center justify-center shrink-0 mt-0.5 font-black text-slate-900 text-xs">U</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <span className="text-amber-400 text-xs font-black">AI</span>
                </div>
                <div className="bg-slate-600/80 px-4 py-3 flex items-center gap-1.5">
                  {[0,1,2].map((i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-slate-400"
                      style={{ animation: `bounce 1s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="flex border-t border-slate-500/40">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && send()}
              placeholder="Ask about stocks, trading strategy, risk management…"
              className="flex-1 bg-slate-700 text-white text-sm px-4 py-3.5 outline-none placeholder-slate-500" />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="px-5 bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors disabled:opacity-50">
              <Ic d={I.send} size={16} stroke="#0f172a" sw={2} />
            </button>
          </div>
        </Card>

        <div>
          <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold mb-3">Suggested Questions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                className="text-left px-4 py-3 bg-slate-700 border border-slate-500/40 text-slate-300 text-xs hover:border-amber-500/50 hover:text-amber-300 transition-all">
                "{s}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}