import React, { useState } from "react";
import { toast } from "sonner";
import { subscribeNewsletter } from "../lib/api";
import { Orbit } from "lucide-react";

const versions = ["CS6", "CC2014", "CC2018", "CC2020", "2022", "2024", "2025"];

export default function MarketingFooter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      const r = await subscribeNewsletter(email.trim(), "marketing");
      toast.success(r.already_subscribed ? "You're already subscribed." : "Subscribed. See you in the update log.");
      setEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.detail?.[0]?.msg || "Could not subscribe. Check your email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer data-testid="marketing-footer" className="border-t border-[#232738] mt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <Orbit className="w-3.5 h-3.5 text-slate-950" strokeWidth={2.5} />
            </span>
            <span className="font-display font-extrabold text-slate-100">Saturn.</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            A truthful compatibility layer for After Effects presets. Analyze first, migrate second.
          </p>
          <form onSubmit={submit} className="mt-6 flex gap-2 max-w-md" data-testid="newsletter-form">
            <input
              data-testid="newsletter-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="flex-1 h-10 px-3 rounded-md bg-[#10121A] border border-[#232738] focus:border-amber-500/60 focus:outline-none text-sm text-slate-100 placeholder:text-slate-600 transition-colors"
            />
            <button
              data-testid="newsletter-submit-button"
              disabled={busy}
              className="h-10 px-4 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 text-sm font-semibold transition-colors"
            >
              {busy ? "…" : "Subscribe"}
            </button>
          </form>
          <p className="mt-3 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-slate-600">
            Update log · rule releases · no spam
          </p>
        </div>

        <div>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-amber-500 mb-4">Product</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#features" className="hover:text-slate-100">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-slate-100">How it works</a></li>
            <li><a href="#pricing" className="hover:text-slate-100">Pricing</a></li>
            <li><a href="/app" className="hover:text-slate-100">Open converter</a></li>
          </ul>
        </div>

        <div>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-amber-500 mb-4">AE Support</p>
          <ul className="space-y-2 text-sm text-slate-400 font-mono-tech">
            {versions.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-amber-500 mb-4">The Fine Print</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#faq" className="hover:text-slate-100">FAQ</a></li>
            <li>Rules engine v1.0.0</li>
            <li className="text-slate-600 text-xs leading-relaxed">
              Saturn analyzes presets and generates compatibility packages. It does <span className="text-slate-300">not</span> rewrite binary .ffx files.
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#232738]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-600">
            © 2026 Saturn Labs · Not affiliated with Adobe
          </p>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-600">
            Built for motion editors
          </p>
        </div>
      </div>
    </footer>
  );
}
