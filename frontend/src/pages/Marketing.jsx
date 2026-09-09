import React, { useEffect, useMemo, useState } from "react";
import MarketingHeader from "../components/MarketingHeader";
import MarketingFooter from "../components/MarketingFooter";
import DownloadSection from "../components/DownloadSection";
import {
  Apple, MonitorSmartphone, ArrowRight, Download, ShieldCheck, Layers,
  Boxes, GitBranch, Sparkles, Check, Cpu, PackageCheck, FileCode2,
  HardDrive, MonitorPlay, Timer, WifiOff, Rocket,
} from "lucide-react";
import { getDownloads } from "../lib/api";

const steps = [
  {
    n: "01",
    icon: Download,
    title: "Install Saturn",
    body: "Grab the signed installer for macOS or Windows. Under 25 MB. No account needed.",
  },
  {
    n: "02",
    icon: FileCode2,
    title: "Drop a preset",
    body: "Drag .ffx, .xml or .json files onto Saturn. Batch a whole folder if you like.",
  },
  {
    n: "03",
    icon: PackageCheck,
    title: "Ship the compat package",
    body: "Pick a target AE version + OS. Saturn hands you a zipped report and manual-step notes.",
  },
];

const features = [
  { icon: ShieldCheck, title: "Honest analysis", body: "Every property is reported as compatible, flagged, fallback, or manual-fix. No black boxes." },
  { icon: WifiOff, title: "Runs offline", body: "The full rules engine ships inside the installer. No preset ever leaves your machine." },
  { icon: Layers, title: "Rules engine v1", body: "20+ hand-curated rules across expression engines, master properties, roto brush 2, GPU particles, layer styles." },
  { icon: Boxes, title: "Batch friendly", body: "Point Saturn at a folder. Every preset gets its own report and its own package." },
  { icon: GitBranch, title: "Portable output", body: "The compatibility package is a plain .zip: original preset + report.json + notes.md. No lock-in." },
  { icon: Rocket, title: "Auto-updates", body: "Opt in to the stable channel. Rule sets ship independently of the app so migrations improve over time." },
];

const changelog = [
  { date: "2026-02-14", version: "1.0.0-beta.3", tag: "rules", entries: ["Added GPU particle + Roto Brush 2 rules for CS6-CC2018 targets", "Fix: expression engine detection heuristics on nested layers"] },
  { date: "2026-02-08", version: "1.0.0-beta.2", tag: "engine", entries: ["JSON preset parser + property-tree walker", "New CLI: `saturn analyze <preset> --target CC2018`"] },
  { date: "2026-01-30", version: "1.0.0-beta.1", tag: "ux", entries: ["First public beta — two-pane converter, batch drop, package export"] },
];

const requirements = {
  macos: {
    icon: Apple,
    label: "macOS",
    rows: [
      ["OS", "macOS 12 Monterey or later"],
      ["Chip", "Universal (Apple Silicon + Intel)"],
      ["RAM", "4 GB minimum · 8 GB recommended"],
      ["Disk", "180 MB"],
      ["AE targets", "CS6 → 2025"],
    ],
  },
  windows: {
    icon: MonitorSmartphone,
    label: "Windows",
    rows: [
      ["OS", "Windows 10 (19041+) or Windows 11"],
      ["Arch", "x64"],
      ["RAM", "4 GB minimum · 8 GB recommended"],
      ["Disk", "220 MB"],
      ["AE targets", "CS6 → 2025"],
    ],
  },
};

const pricing = [
  {
    plan: "Free",
    testid: "pricing-free",
    price: "$0",
    tag: "For freelancers",
    features: ["Full desktop app", "Unlimited analyses", "All 20+ rules", "Compatibility packages", "Auto-updates"],
    cta: "Download free",
    ctaHref: "#download",
    highlight: false,
  },
  {
    plan: "Pro",
    testid: "pricing-pro",
    price: "$9",
    period: "/mo",
    tag: "For working motion designers",
    features: ["Everything in Free", "Cloud library across machines", "Priority rule updates", "Import/export rule sets", "1-click 'send to client'"],
    cta: "Notify me on release",
    highlight: true,
  },
  {
    plan: "Team",
    testid: "pricing-team",
    price: "$29",
    period: "/mo per seat",
    tag: "For studios",
    features: ["Everything in Pro", "Shared rule profiles", "Team preset library", "Studio-wide audit log", "Priority support"],
    cta: "Notify me on release",
    highlight: false,
  },
];

const faqs = [
  { q: "Does Saturn rewrite .ffx binaries?", a: "No — and we won't pretend to. Adobe's .ffx binary format isn't publicly documented. Saturn reads the metadata inside, runs it through its rule engine, and gives you a compatibility package (original + report + notes) you can act on in After Effects." },
  { q: "What formats do you actually parse?", a: "Full parsing on .xml and .json presets. Best-effort text/metadata extraction on .ffx. Everything runs through the same rule engine." },
  { q: "Do my presets leave my machine?", a: "No. The desktop app ships with the rules engine bundled. Analysis runs locally — nothing is uploaded." },
  { q: "Which AE versions are supported?", a: "CS6, CC2014, CC2018, CC2020, 2021, 2022, 2023, 2024, 2025 — both macOS and Windows targets." },
  { q: "Where do the compatibility rules come from?", a: "Hand-curated from Adobe release notes, community-tested edge cases, and studio bug reports. New rule sets auto-download in the stable channel." },
  { q: "Is this affiliated with Adobe?", a: "No. Saturn is an independent tool. After Effects is a trademark of Adobe Inc." },
];

export default function Marketing() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDownloads().then(setData).catch(() => setData(null));
  }, []);

  const detectedOs = useMemo(() => {
    if (typeof navigator === "undefined") return "macos";
    return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent || "") ? "macos" : "windows";
  }, []);

  const primaryBuild = data?.builds?.find((b) => b.os === detectedOs);

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100">
      <MarketingHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-backdrop opacity-40 pointer-events-none" />
        <div
          className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full opacity-30 animate-drift pointer-events-none"
          style={{ background: "radial-gradient(closest-side, rgba(245,158,11,0.55), rgba(255,107,0,0.15), transparent)" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
          <div className="animate-fade-up">
            <p data-testid="hero-eyebrow" className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-6">
              Native desktop · macOS + Windows · v{data?.version ?? "1.0.0-beta"}
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.03] tracking-tight text-slate-50">
              Ship a preset once.<br />
              <span className="text-slate-500">Run it on</span>{" "}
              <span className="text-amber-400">every AE version.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-400 leading-relaxed">
              Saturn is a small desktop app for motion designers. Drop a preset, pick a target AE version, get a compatibility package with concrete fallbacks — <span className="text-slate-200">not a black-box binary rewriter</span>.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={`#download`}
                data-testid="hero-primary-cta"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold tracking-tight shadow-[0_0_28px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] transition-all"
              >
                <Download className="w-4 h-4" />
                Download for {primaryBuild?.label ?? (detectedOs === "macos" ? "macOS" : "Windows")}
              </a>
              <a
                href="#how-it-works"
                data-testid="hero-secondary-cta"
                className="inline-flex items-center gap-2 h-12 px-5 rounded-md border border-[#343A52] hover:border-amber-500/50 hover:text-amber-300 text-sm text-slate-300 transition-colors"
              >
                See how it works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs font-mono-tech uppercase tracking-[0.22em] text-slate-500">
              <span><span className="text-amber-500">•</span> CS6 → 2025</span>
              <span><span className="text-amber-500">•</span> Runs offline</span>
              <span><span className="text-amber-500">•</span> Free during beta</span>
            </div>
          </div>

          {/* App screenshot mock */}
          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative rounded-2xl bg-[#0C0E16] border border-[#232738] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#232738] bg-[#10121A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B3F55]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B3F55]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B3F55]" />
                <span className="ml-3 font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500">Saturn.app · GlitchRig.xml → CC2018</span>
              </div>
              <div className="grid grid-cols-[1fr_1fr]">
                <div className="p-5 border-r border-[#232738] space-y-3">
                  <p className="font-mono-tech text-[9px] uppercase tracking-[0.22em] text-amber-500">Input</p>
                  <div className="rounded-md border border-dashed border-[#343A52] p-4 text-center">
                    <FileCode2 className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-300">GlitchRig.xml</p>
                    <p className="font-mono-tech text-[9px] uppercase tracking-widest text-slate-600 mt-1">3.2 kb · xml</p>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {["CS6", "CC2018", "CC2020", "2024"].map((v) => (
                      <span key={v} className={`text-[9px] py-1 rounded font-mono-tech text-center uppercase tracking-widest ${v === "CC2018" ? "bg-amber-500 text-slate-950 font-bold" : "border border-[#232738] text-slate-500"}`}>{v}</span>
                    ))}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <p className="font-mono-tech text-[9px] uppercase tracking-[0.22em] text-amber-500">Report</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    <Metric v="3" k="OK" tone="emerald" />
                    <Metric v="2" k="Flag" tone="amber" />
                    <Metric v="1" k="Fb" tone="blue" />
                    <Metric v="1" k="Todo" tone="red" />
                  </div>
                  <pre className="font-mono-tech text-[10px] leading-relaxed text-slate-400 rounded-md bg-[#0A0C12] border border-[#232738] p-3 overflow-hidden">
{`manual_todo: roto-brush-2
flagged:     shape-taper-wave
fallback:    convert_to_stroke
compatible:  wiggle, sourceRectAtTime`}
                  </pre>
                </div>
              </div>
              <div className="border-t border-[#232738] px-5 py-4 flex items-center justify-between bg-[#0A0C12]">
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500">1 manual todo · 2 flagged</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-400"><PackageCheck className="w-3.5 h-3.5" /> package ready</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 rounded-lg border border-[#232738] bg-[#10121A] px-4 py-3 shadow-xl">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500">Rules engine</p>
              <p className="text-sm font-semibold text-slate-100">v1.0.0 · <span className="text-amber-400">20+ rules</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD SECTION */}
      <DownloadSection />

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-10 py-24 border-t border-[#232738]">
        <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">03 steps</p>
        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl">
          Install once. <span className="text-slate-500">Migrate presets forever.</span>
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} data-testid={`how-step-${s.n}`} className="hover-lift rounded-xl bg-[#10121A] border border-[#232738] p-8 relative overflow-hidden">
              <span className="absolute right-6 top-6 font-mono-tech text-6xl font-bold text-slate-800 select-none">{s.n}</span>
              <s.icon className="w-6 h-6 text-amber-400 mb-6" />
              <h3 className="font-display text-xl font-semibold mb-2 tracking-tight">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-[#232738]">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">Features</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">Built the way motion designers actually work.</h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              No hype. No fake "AI" claims. A precise rule engine, a fast native app, and a report you can send to a client.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} data-testid={`feature-${i}`} className="hover-lift rounded-xl bg-[#10121A] border border-[#232738] p-6">
                <f.icon className="w-5 h-5 text-amber-400 mb-4" />
                <h3 className="font-display text-lg font-semibold tracking-tight mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCREENSHOTS */}
      <section id="screenshots" className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-[#232738]">
        <div className="flex items-end justify-between mb-10 gap-8 flex-wrap">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">Inside the app</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight max-w-xl">Editorial workspace, not a settings dialog.</h2>
          </div>
          <span className="font-mono-tech text-xs text-slate-500">rendered from the actual v{data?.version ?? "1.0.0-beta.3"} build</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Converter */}
          <div className="rounded-xl border border-[#232738] bg-[#0C0E16] overflow-hidden p-5">
            <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500 mb-3">Converter</p>
            <div className="rounded-md border border-dashed border-[#343A52] p-6 text-center">
              <FileCode2 className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-slate-200">Drop presets here</p>
              <p className="font-mono-tech text-[10px] uppercase tracking-widest text-slate-500 mt-1">.ffx · .xml · .json</p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {["CS6", "CC2018", "CC2020", "2024"].map((v) => (
                <span key={v} className={`text-[10px] py-1 rounded font-mono-tech text-center uppercase tracking-widest ${v === "CC2020" ? "bg-amber-500 text-slate-950 font-bold" : "border border-[#232738] text-slate-500"}`}>{v}</span>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Two-pane workspace with a live report drawer. Batch a whole folder in one pass.
            </p>
          </div>

          {/* Library */}
          <div className="rounded-xl border border-[#232738] bg-[#0C0E16] overflow-hidden p-5">
            <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500 mb-3">Preset library</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: "WarmGlow", t: "CC2020" },
                { n: "CameraRig", t: "2024" },
                { n: "GlitchRig", t: "CC2018" },
                { n: "Typewriter", t: "CC2019" },
                { n: "Shake3D", t: "2025" },
                { n: "AutoKerning", t: "CC2020" },
              ].map((c) => (
                <div key={c.n} className="rounded-md border border-[#232738] bg-[#10121A] p-2">
                  <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-[11px] text-slate-100 mt-1 truncate">{c.n}</p>
                  <p className="font-mono-tech text-[8px] uppercase tracking-widest text-amber-300 mt-0.5">{c.t}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Save any analyzed preset. Tag by AE version, effect type or client. Search fast.
            </p>
          </div>

          {/* Rules */}
          <div className="rounded-xl border border-[#232738] bg-[#0C0E16] overflow-hidden p-5">
            <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500 mb-3">Rules inspector</p>
            <div className="space-y-1.5">
              {[
                { id: "roto-brush-2", cat: "effect", tone: "red" },
                { id: "shape-taper-wave", cat: "shape", tone: "amber" },
                { id: "essential-graphics", cat: "eg", tone: "red" },
                { id: "expr-engine-js", cat: "expr", tone: "amber" },
                { id: "posterizeTime", cat: "expr", tone: "emerald" },
              ].map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-md border border-[#232738] bg-[#10121A] px-2 py-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${r.tone === "red" ? "bg-red-400" : r.tone === "amber" ? "bg-amber-400" : "bg-emerald-400"}`} />
                  <span className="font-mono-tech text-[10px] text-slate-200 truncate">{r.id}</span>
                  <span className="ml-auto font-mono-tech text-[9px] uppercase tracking-widest text-slate-500 shrink-0">{r.cat}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Every rule is browsable, versioned, and export-friendly. Rule packs update independently.
            </p>
          </div>
        </div>
      </section>

      {/* SYSTEM REQUIREMENTS */}
      <section id="requirements" className="max-w-7xl mx-auto px-6 lg:px-10 py-24 border-t border-[#232738]">
        <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">System requirements</p>
        <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight max-w-2xl">Runs on the machine you already own.</h2>
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {Object.entries(requirements).map(([os, req]) => (
            <div key={os} data-testid={`req-${os}`} className="rounded-xl border border-[#232738] bg-[#10121A] p-6">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#232738]">
                <div className="w-9 h-9 rounded-lg bg-[#0C0E16] border border-[#232738] flex items-center justify-center text-amber-300">
                  <req.icon className="w-4 h-4" />
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight">{req.label}</h3>
              </div>
              <dl className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-6">
                {req.rows.map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500 pt-0.5">{k}</dt>
                    <dd className="text-sm text-slate-200">{v}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* CHANGELOG */}
      <section id="changelog" className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-[#232738]">
        <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">Changelog</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">Shipped recently</h2>
          </div>
          <span className="font-mono-tech text-xs text-slate-500">stable channel</span>
        </div>
        <div className="rounded-xl border border-[#232738] divide-y divide-[#232738] overflow-hidden">
          {changelog.map((u, i) => (
            <div key={i} className="grid md:grid-cols-[140px_120px_1fr] gap-3 md:gap-6 px-6 py-5 hover:bg-[#10121A]/60 transition-colors">
              <div className="flex md:flex-col gap-2 md:gap-1">
                <span className="font-mono-tech text-xs text-slate-500">{u.date}</span>
                <span className="font-mono-tech text-xs text-amber-400">v{u.version}</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono-tech text-[10px] uppercase tracking-[0.2em] w-fit h-fit">
                {u.tag}
              </span>
              <ul className="space-y-1.5 text-sm text-slate-200">
                {u.entries.map((e, k) => (
                  <li key={k} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">›</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 lg:px-10 py-24 border-t border-[#232738]">
        <div className="flex flex-col items-start mb-14">
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">Pricing</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">Free during beta. Paid when it saves you a day.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {pricing.map((p) => (
            <div
              key={p.plan}
              data-testid={p.testid}
              className={`hover-lift rounded-xl border p-8 relative overflow-hidden ${p.highlight ? "bg-[#141722] border-amber-500/40 shadow-[0_0_28px_rgba(245,158,11,0.12)]" : "bg-[#10121A] border-[#232738]"}`}
            >
              {p.highlight && (
                <span className="absolute top-4 right-4 font-mono-tech text-[10px] uppercase tracking-[0.22em] bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                  Most fitting
                </span>
              )}
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500">{p.tag}</p>
              <h3 className="font-display text-2xl font-bold mt-2">{p.plan}</h3>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-5xl font-extrabold text-slate-50">{p.price}</span>
                {p.period && <span className="text-sm text-slate-500">{p.period}</span>}
              </div>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((ff, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>{ff}</span>
                  </li>
                ))}
              </ul>
              {p.ctaHref ? (
                <a
                  href={p.ctaHref}
                  data-testid={`${p.testid}-cta`}
                  className={`mt-8 inline-flex w-full items-center justify-center h-11 rounded-md text-sm font-semibold transition-colors ${p.highlight ? "bg-amber-500 hover:bg-amber-400 text-slate-950" : "border border-[#343A52] hover:border-amber-500/50 hover:text-amber-300 text-slate-200"}`}
                >
                  {p.cta}
                </a>
              ) : (
                <button
                  disabled
                  data-testid={`${p.testid}-cta`}
                  className="mt-8 inline-flex w-full items-center justify-center h-11 rounded-md border border-[#343A52] text-sm font-semibold text-slate-500 cursor-not-allowed"
                >
                  {p.cta}
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 font-mono-tech text-[11px] uppercase tracking-[0.22em] text-slate-600">
          Pro / Team billing ships alongside 1.0 · Free tier stays free
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 lg:px-10 py-24 border-t border-[#232738]">
        <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">FAQ</p>
        <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-10">Straight answers.</h2>
        <div className="divide-y divide-[#232738] border-y border-[#232738]">
          {faqs.map((f, i) => (
            <details key={i} data-testid={`faq-${i}`} className="group py-5">
              <summary className="cursor-pointer flex items-start justify-between gap-6 list-none">
                <span className="font-display text-base sm:text-lg font-semibold text-slate-100">{f.q}</span>
                <span className="mt-1 text-amber-500 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-2xl">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#141722] to-[#0C0E16] p-10 lg:p-14">
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(closest-side, rgba(245,158,11,0.7), transparent)" }} />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-400 mb-3">Ready</p>
              <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight max-w-xl">Install Saturn and analyze your first preset before your coffee's cold.</h3>
            </div>
            <a
              href="#download"
              data-testid="cta-launch-band"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold tracking-tight shadow-[0_0_24px_rgba(245,158,11,0.4)] transition-all"
            >
              <Download className="w-4 h-4" /> Get Saturn
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Metric({ v, k, tone }) {
  const toneMap = {
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    red: "border-red-500/30 bg-red-500/10 text-red-300",
  };
  return (
    <div className={`rounded-md border px-2 py-1.5 text-center ${toneMap[tone]}`}>
      <p className="font-display font-extrabold text-lg leading-none">{v}</p>
      <p className="font-mono-tech text-[8px] uppercase tracking-[0.2em] mt-1 opacity-80">{k}</p>
    </div>
  );
}
