import { useState, useEffect, useRef } from "react";
import { Layout } from "../components/Layout";
import { Card, Spinner, Ic, I } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const COLORS = ["text-amber-400","text-emerald-400","text-blue-400","text-purple-400","text-pink-400","text-cyan-400"];

function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const fetchMsgs = async () => {
    try {
      const { data } = await api.get("/chat?room=general&limit=60");
      setMsgs(data.messages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMsgs(); }, []);

  useEffect(() => {
    const t = setInterval(fetchMsgs, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput(""); setSending(true);
    try {
      await api.post("/chat", { message: text, room: "general" });
      await fetchMsgs();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  return (
    <Layout title="Community Chat">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className="bg-slate-700/40 border border-slate-500/40 px-5 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">General · Trading Lounge</span>
          </div>
          <span className="text-slate-500 text-xs">Messages saved in database · Visible to all users</span>
          <button onClick={fetchMsgs} className="ml-auto text-slate-400 hover:text-amber-400 transition-colors">
            <Ic d={I.refresh} size={14} />
          </button>
        </div>

        <Card className="flex flex-col" style={{ height: 520 }}>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : msgs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Ic d={I.chat} size={32} stroke="#475569" />
                <p className="text-slate-500 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              msgs.map((m, i) => {
                const isMe = m.user?.name === user?.name;
                const col  = colorFor(m.user?.name || "");
                return (
                  <div key={i} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 flex items-center justify-center font-black text-sm shrink-0 ${isMe ? "bg-amber-500 text-slate-900" : "bg-slate-600"}`}>
                      <span className={!isMe ? col : ""}>{(m.user?.name || "?")[0].toUpperCase()}</span>
                    </div>
                    <div className={`flex flex-col gap-1 max-w-md ${isMe ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isMe ? "text-amber-400" : col}`}>
                          {isMe ? "You" : m.user?.name}
                        </span>
                        <span className="text-slate-600 text-xs">
                          {new Date(m.createdAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                        </span>
                      </div>
                      <div className={`px-4 py-2.5 text-sm leading-relaxed
                        ${isMe ? "bg-amber-500/20 text-amber-100 border-r-2 border-amber-500" : "bg-slate-600/60 text-slate-300"}`}>
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>
          <div className="flex border-t border-slate-500/40">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Share a trade idea, ask a question…"
              className="flex-1 bg-slate-700 text-white text-sm px-4 py-3.5 outline-none placeholder-slate-500"
              maxLength={500} />
            <button onClick={send} disabled={sending || !input.trim()}
              className="px-5 bg-slate-600 text-slate-300 hover:bg-amber-500 hover:text-slate-900 transition-all disabled:opacity-50">
              {sending ? <Spinner size="sm" /> : <Ic d={I.send} size={16} />}
            </button>
          </div>
        </Card>
        <p className="text-slate-600 text-xs text-center">
          Messages stored in MongoDB · Auto-refreshes every 5 seconds
        </p>
      </div>
    </Layout>
  );
}