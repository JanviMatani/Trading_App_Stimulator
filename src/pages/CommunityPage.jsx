import { useState, useEffect, useRef } from "react";
import { Layout } from "../components/Layout";
import { Card, Spinner, Ic, I, useT } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const COLORS = [
  "text-amber-500","text-emerald-500","text-blue-500",
  "text-purple-500","text-pink-500","text-cyan-500",
];

function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function CommunityPage() {
  const { user } = useAuth();
  const t = useT();
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const fetchMsgs = async () => {
    try {
      const { data } = await api.get("/chat?room=general&limit=60");
      setMsgs(data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMsgs(); }, []);

  useEffect(() => {
    const timer = setInterval(fetchMsgs, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await api.post("/chat", { message: text, room: "general" });
      await fetchMsgs();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title="Community Chat">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">

        {/* Header banner */}
        <div className={`border rounded-2xl px-5 py-3 flex items-center gap-4 flex-wrap
          ${t.dark
            ? "bg-slate-800/60 border-slate-600/50"
            : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-500 text-xs font-semibold">General · Trading Lounge</span>
          </div>
          <span className={`${t.muted} text-xs`}>
            Messages saved in database · Visible to all users
          </span>
          <button onClick={fetchMsgs}
            className={`ml-auto ${t.muted} hover:text-amber-500 transition-colors p-1.5 rounded-lg ${t.hover}`}>
            <Ic d={I.refresh} size={14} />
          </button>
        </div>

        {/* Chat window */}
        <Card className="flex flex-col overflow-hidden" style={{ height: 520 }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : msgs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                  ${t.dark ? "bg-slate-700" : "bg-slate-100"}`}>
                  <Ic d={I.chat} size={26} stroke="#94a3b8" />
                </div>
                <p className={`${t.muted} text-sm`}>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              msgs.map((m, i) => {
                const isMe = m.user?.name === user?.name;
                const col  = colorFor(m.user?.name || "");
                return (
                  <div key={i} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0
                      ${isMe
                        ? "bg-amber-500 text-slate-900"
                        : t.dark ? "bg-slate-700" : "bg-slate-100"}`}>
                      <span className={!isMe ? col : ""}>
                        {(m.user?.name || "?")[0].toUpperCase()}
                      </span>
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col gap-1 max-w-md ${isMe ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isMe ? "text-amber-500" : col}`}>
                          {isMe ? "You" : m.user?.name}
                        </span>
                        <span className={`${t.subtle} text-xs`}>
                          {new Date(m.createdAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                        </span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isMe
                          ? t.dark
                            ? "bg-amber-500/20 text-amber-100 border-r-2 border-amber-500"
                            : "bg-amber-500 text-white"
                          : t.dark
                            ? "bg-slate-700/80 text-slate-200"
                            : "bg-slate-100 text-slate-700"}`}>
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className={`flex border-t ${t.divider}`}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Share a trade idea, ask a question…"
              className={`flex-1 text-sm px-4 py-3.5 outline-none
                ${t.dark
                  ? "bg-slate-800 text-white placeholder-slate-500"
                  : "bg-slate-50 text-slate-800 placeholder-slate-400"}`}
              maxLength={500}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="px-5 bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all disabled:opacity-50">
              {sending ? <Spinner size="sm" /> : <Ic d={I.send} size={16} stroke="#0f172a" sw={2} />}
            </button>
          </div>
        </Card>

        <p className={`${t.subtle} text-xs text-center`}>
          Messages stored in MongoDB · Auto-refreshes every 5 seconds
        </p>
      </div>
    </Layout>
  );
}