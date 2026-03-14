import { useState } from "react";
import { Modal, Button, Input, Ic, I, fmt$, useT } from "./UI";

const CARD_NETWORKS = [
  { id: "visa",       label: "Visa",       icon: "💳" },
  { id: "mastercard", label: "Mastercard", icon: "💳" },
  { id: "rupay",      label: "RuPay",      icon: "💳" },
  { id: "upi",        label: "UPI",        icon: "📱" },
];

function formatCardNum(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(val) {
  const v = val.replace(/\D/g, "").slice(0, 4);
  return v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
}

export default function PaymentModal({ open, onClose, onSuccess, amount, symbol, quantity, price, type }) {
  const t = useT();
  const [step,    setStep]    = useState("method");
  const [method,  setMethod]  = useState("visa");
  const [cardNum, setCardNum] = useState("");
  const [expiry,  setExpiry]  = useState("");
  const [cvv,     setCvv]     = useState("");
  const [name,    setName]    = useState("");
  const [upiId,   setUpiId]   = useState("");
  const [error,   setError]   = useState("");

  const reset = () => {
    setStep("method"); setCardNum(""); setExpiry("");
    setCvv(""); setName(""); setUpiId(""); setError("");
  };

  const handleClose = () => { reset(); onClose(); };

  const pay = () => {
    setError("");
    if (method === "upi") {
      if (!upiId.includes("@")) { setError("Enter a valid UPI ID (e.g. user@paytm)"); return; }
    } else {
      if (cardNum.replace(/\s/g, "").length < 16) { setError("Enter a valid 16-digit card number"); return; }
      if (expiry.length < 5) { setError("Enter a valid expiry (MM/YY)"); return; }
      if (cvv.length < 3)    { setError("Enter a valid CVV"); return; }
      if (!name.trim())      { setError("Enter cardholder name"); return; }
    }
    setStep("processing");
    setTimeout(() => {
      setStep("done");
      setTimeout(() => { reset(); onSuccess(); }, 1800);
    }, 2200);
  };

  const isUpi = method === "upi";

  return (
    <Modal open={open} onClose={handleClose} title="Complete Payment" width="max-w-md">
      {/* Order summary */}
      <div className={`${t.dark ? "bg-slate-700/60" : "bg-slate-50"} border ${t.border} rounded-xl p-4 mb-5`}>
        <div className="flex justify-between items-center mb-1">
          <span className={`${t.muted} text-xs font-medium`}>Order</span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full
            ${type === "BUY" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
            {type}
          </span>
        </div>
        <p className={`${t.text} font-semibold`}>{quantity} × {symbol} @ ${fmt$(price)}</p>
        <p className="text-amber-500 font-bold text-xl mt-1">${fmt$(amount)}</p>
        <p className={`${t.subtle} text-xs mt-0.5`}>Virtual funds · No real money charged</p>
      </div>

      {step === "method" && (
        <>
          <p className={`${t.muted} text-xs font-semibold uppercase tracking-wider mb-3`}>Select Payment Method</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {CARD_NETWORKS.map((c) => (
              <button key={c.id} onClick={() => setMethod(c.id)}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border transition-all text-sm font-medium
                  ${method === c.id
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : `${t.border} ${t.dark ? "bg-slate-700/50 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"} ${t.muted}`}`}>
                <span className="text-lg">{c.icon}</span>
                <span>{c.label}</span>
                {method === c.id && <Ic d={I.check} size={14} stroke="#f59e0b" sw={2.5} />}
              </button>
            ))}
          </div>
          <Button onClick={() => setStep(isUpi ? "upi" : "card")} variant="primary" className="w-full" size="lg">
            Continue <Ic d={I.arrowR} size={16} />
          </Button>
        </>
      )}

      {step === "card" && (
        <div className="flex flex-col gap-4">
          {/* Card preview */}
          <div className="h-36 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)" }}>
            <div className="flex justify-between items-start">
              <p className="text-slate-300 text-xs font-medium uppercase tracking-widest">Virtual Card</p>
              <span className="text-white font-bold text-sm">
                {CARD_NETWORKS.find((c) => c.id === method)?.label}
              </span>
            </div>
            <div>
              <p className="text-white font-mono text-lg tracking-widest">
                {cardNum || "•••• •••• •••• ••••"}
              </p>
              <div className="flex justify-between mt-2">
                <p className="text-slate-400 text-xs">{name || "CARDHOLDER NAME"}</p>
                <p className="text-slate-400 text-xs">{expiry || "MM/YY"}</p>
              </div>
            </div>
          </div>

          <Input label="Card Number" placeholder="1234 5678 9012 3456"
            value={cardNum} onChange={(e) => setCardNum(formatCardNum(e.target.value))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Expiry" placeholder="MM/YY"
              value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} />
            <Input label="CVV" placeholder="•••" type="password" maxLength={4}
              value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          </div>
          <Input label="Cardholder Name" placeholder="As on card"
            value={name} onChange={(e) => setName(e.target.value)} />

          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3">
            <Button onClick={() => { setStep("method"); setError(""); }} variant="ghost" className="flex-1">← Back</Button>
            <Button onClick={pay} variant="primary" className="flex-1">Pay ${fmt$(amount)}</Button>
          </div>
        </div>
      )}

      {step === "upi" && (
        <div className="flex flex-col gap-4">
          <div className={`${t.dark ? "bg-slate-700/50" : "bg-purple-50"} border border-purple-500/30 rounded-xl p-4 text-center`}>
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">📱</span>
            </div>
            <p className={`${t.text} font-semibold`}>UPI Payment</p>
            <p className={`${t.muted} text-xs mt-1`}>Enter your UPI ID to proceed</p>
          </div>
          <Input label="UPI ID" placeholder="yourname@paytm / @gpay / @upi"
            value={upiId} onChange={(e) => setUpiId(e.target.value)} />
          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={() => { setStep("method"); setError(""); }} variant="ghost" className="flex-1">← Back</Button>
            <Button onClick={pay} variant="primary" className="flex-1">Pay ${fmt$(amount)}</Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center justify-center py-10 gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Ic d={I.credit} size={28} stroke="#f59e0b" sw={1.5} />
            </div>
          </div>
          <div className="text-center">
            <p className={`${t.text} font-semibold text-lg`}>Processing Payment</p>
            <p className={`${t.muted} text-sm mt-1`}>Verifying your transaction…</p>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center"
            style={{ animation: "fadeUp .4s ease both" }}>
            <Ic d={I.check} size={36} stroke="#34d399" sw={2.5} />
          </div>
          <div className="text-center">
            <p className={`${t.text} font-bold text-xl`}>Payment Successful!</p>
            <p className={`${t.muted} text-sm mt-1`}>Your trade is being executed…</p>
          </div>
        </div>
      )}
    </Modal>
  );
}