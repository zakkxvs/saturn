import React, { useState } from "react";
import { putSettings } from "../lib/api";
import { toast } from "sonner";
import { Orbit, X } from "lucide-react";

const VERSIONS = ["CS6", "CC2014", "CC2018", "CC2020", "2022", "2024", "2025"];

export default function FirstRunModal({ onClose }) {
  const [ae, setAe] = useState("2024");
  const [os, setOs] = useState("macos");
  const [safe, setSafe] = useState(true);
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    try {
      const next = await putSettings({
        default_ae_version: ae,
        default_os: os,
        theme: "dark",
        autosave: safe,
        notifications: true,
        first_run_completed: true,
      });
      toast.success("Setup saved. Drop a preset to start.");
      onClose(next);
    } catch (e) {
      toast.error("Could not save setup");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="first-run-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090D]/85 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-xl border border-[#232738] bg-[#0C0E16] shadow-2xl overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232738]">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <Orbit className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
            </span>
            <div>
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500">Welcome</p>
              <h2 className="font-display font-bold text-lg text-slate-100">One-time setup</h2>
            </div>
          </div>
          <button data-testid="first-run-close" onClick={() => onClose(null)} className="text-slate-500 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500">Default target AE version</label>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {VERSIONS.map((v) => (
                <button
                  key={v}
                  data-testid={`first-run-version-${v}`}
                  onClick={() => setAe(v)}
                  className={`h-10 rounded-md font-mono-tech text-xs uppercase tracking-widest transition-all ${
                    ae === v
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "border border-[#232738] text-slate-300 hover:border-amber-500/40"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500">Default OS</label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["macos", "windows"].map((o) => (
                <button
                  key={o}
                  data-testid={`first-run-os-${o}`}
                  onClick={() => setOs(o)}
                  className={`h-10 rounded-md text-sm font-medium transition-all uppercase tracking-wide ${
                    os === o
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "border border-[#232738] text-slate-300 hover:border-amber-500/40"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-md border border-[#232738] bg-[#10121A]">
            <input
              id="safe-toggle"
              data-testid="first-run-safe-toggle"
              type="checkbox"
              checked={safe}
              onChange={(e) => setSafe(e.target.checked)}
              className="mt-0.5 accent-amber-500"
            />
            <label htmlFor="safe-toggle" className="text-sm text-slate-300">
              <span className="font-semibold text-slate-100">Safe conversion by default</span>
              <span className="block text-xs text-slate-500 mt-1">Apply documented fallbacks automatically. You can override this per file.</span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#232738] flex items-center justify-end gap-3">
          <button
            data-testid="first-run-skip"
            onClick={() => onClose(null)}
            className="h-10 px-4 rounded-md border border-[#343A52] text-sm text-slate-300 hover:border-slate-500"
          >
            Skip
          </button>
          <button
            data-testid="first-run-save"
            disabled={busy}
            onClick={finish}
            className="h-10 px-5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Saving…" : "Start using Saturn"}
          </button>
        </div>
      </div>
    </div>
  );
}
