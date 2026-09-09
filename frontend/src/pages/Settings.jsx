import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getSettings, putSettings } from "../lib/api";
import { toast } from "sonner";
import { Sliders } from "lucide-react";

const VERSIONS = ["CS6", "CC2014", "CC2018", "CC2020", "2022", "2024", "2025"];

export default function Settings() {
  const ctx = useOutletContext() || {};
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { getSettings().then(setS).catch(() => {}); }, []);

  if (!s) return <div className="font-mono-tech text-xs text-slate-500 uppercase tracking-widest">loading…</div>;

  const save = async () => {
    setBusy(true);
    try {
      const next = await putSettings({
        default_ae_version: s.default_ae_version,
        default_os: s.default_os,
        theme: s.theme || "dark",
        autosave: !!s.autosave,
        notifications: !!s.notifications,
        first_run_completed: true,
      });
      setS(next);
      if (ctx.setSettings) ctx.setSettings(next);
      toast.success("Settings saved");
    } catch { toast.error("Save failed"); }
    finally { setBusy(false); }
  };

  return (
    <div data-testid="settings-page" className="max-w-3xl space-y-8">
      <div>
        <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500">Settings</p>
        <h2 className="font-display text-2xl font-bold tracking-tight mt-1 flex items-center gap-3">
          <Sliders className="w-5 h-5 text-amber-400" /> Preferences
        </h2>
      </div>

      <Section title="Default target">
        <div>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-3">AE version</p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {VERSIONS.map((v) => (
              <button
                key={v}
                data-testid={`settings-ae-${v}`}
                onClick={() => setS({ ...s, default_ae_version: v })}
                className={`h-9 rounded-md font-mono-tech text-xs uppercase tracking-widest ${
                  s.default_ae_version === v ? "bg-amber-500 text-slate-950 font-bold" : "border border-[#232738] text-slate-300 hover:border-amber-500/40"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-3">OS</p>
          <div className="grid grid-cols-2 gap-2 max-w-xs">
            {["macos", "windows"].map((o) => (
              <button
                key={o}
                data-testid={`settings-os-${o}`}
                onClick={() => setS({ ...s, default_os: o })}
                className={`h-9 rounded-md text-xs uppercase tracking-wide font-medium ${
                  s.default_os === o ? "bg-amber-500 text-slate-950 font-bold" : "border border-[#232738] text-slate-300 hover:border-amber-500/40"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Behavior">
        <Toggle
          testid="settings-autosave"
          label="Auto-save conversions to history"
          desc="Every analysis is stored in your session history so you can re-download the package later."
          value={!!s.autosave}
          onChange={(v) => setS({ ...s, autosave: v })}
        />
        <Toggle
          testid="settings-notifications"
          label="Toast notifications"
          desc="Show inline status toasts after conversions and saves."
          value={!!s.notifications}
          onChange={(v) => setS({ ...s, notifications: v })}
        />
      </Section>

      <div>
        <button
          data-testid="settings-save-button"
          disabled={busy}
          onClick={save}
          className="h-11 px-6 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-[#232738] bg-[#10121A] p-6 space-y-5">
      <h3 className="font-display font-semibold text-slate-100 text-lg tracking-tight">{title}</h3>
      {children}
    </section>
  );
}

function Toggle({ label, desc, value, onChange, testid }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-md border border-[#232738] bg-[#0C0E16]">
      <button
        data-testid={testid}
        onClick={() => onChange(!value)}
        className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${value ? "bg-amber-500" : "bg-[#232738]"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
      <div>
        <p className="text-sm font-semibold text-slate-100">{label}</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
