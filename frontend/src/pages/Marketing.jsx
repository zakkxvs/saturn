import React from "react";
import { Link } from "react-router-dom";
import MarketingHeader from "../components/MarketingHeader";
import MarketingFooter from "../components/MarketingFooter";
import { ArrowRight, FileCode2, Cpu, PackageCheck, ShieldCheck, Sparkles, Clock, Layers, Boxes, GitBranch, Check } from "lucide-react";

const versions = ["CS6", "CC2014", "CC2018", "CC2020", "2022", "2024", "2025"];

const steps = [
  {
    n: "01",
    icon: FileCode2,
    title: "Drop your preset",
    body: ".ffx, .xml, .json — one file or a batch. We parse what we can and read what we can't.",
  },
  {
    n: "02",
    icon: Cpu,
    title: "Pick the target",
    body: "AE version (CS6 → 2025) and OS. Optional source-version detection. Toggle safe fallbacks.",
  },
  {
    n: "03",
    icon: PackageCheck,
    title: "Get the package",
    body: "A downloadable .zip: original preset + machine-readable report + human notes + manual steps.",
  },
];

const features = [
  { icon: ShieldCheck, title: "Honest analysis", body: "We tell you exactly which properties survive, which need fallbacks, and which you must fix by hand." },
  { icon: Layers, title: "Rule engine v1", body: "20+ hand-curated rules across expression engines, master properties, roto brush 2, GPU particles, layer styles." },
  { icon: Boxes, title: "Batch friendly", body: "Analyze folders of presets in one pass. Every file gets its own report." },
  { icon: GitBranch, title: "Portable output", body: "The compatibility package is a plain .zip. No lock-in, no proprietary blob." },
];

const updates = [
  { date: "2026-02-14", tag: "rules", title: "Added GPU particle + Roto Brush 2 rules for CS6-CC2018 targets" },
  { date: "2026-02-08", tag: "engine", title: "JSON preset parser + property-tree walker" },
  { date: "2026-01-30", tag: "ux", title: "Two-pane converter shell with live report drawer" },
];

const faqs = [
  { q: "Does Saturn rewrite .ffx binaries?", a: "No — and we won't pretend to. Adobe's .ffx binary format isn't publicly documented. Saturn reads the metadata inside, runs it through the rule engine, and generates a compatibility package (original + report + notes) you can act on in AE." },
  { q: "What formats do you actually parse?", a: "Full parsing on .xml and .json presets. Best-effort text/metadata extraction on .ffx. Everything runs through the same rule engine." },
  { q: "Is my preset uploaded anywhere permanent?", a: "By default we keep a copy in your session history so you can re-download the package. You can delete any entry from History at any time. No cross-user sharing." },
  { q: "Which AE versions are supported?", a: "CS6, CC2014, CC2018, CC2020, 2021, 2022, 2023, 2024, 2025 — both macOS and Windows targets." },
  { q: "Where do the compatibility rules come from?", a: "Hand-curated from Adobe release notes, community-tested edge cases, and studio bug reports. Every rule is browsable inside the Rules panel." },
];

const pricing = [
  {
    plan: "Free",
    testid: "pricing-free",
    price: "$0",
    tag: "For freelancers",
    features: ["Unlimited analyses", "Session history & library (this browser)", "All parse formats", "Compatibility packages"],
    cta: "Open converter",
    ctaLink: "/app",
    highlight: false,
  },
  {
    plan: "Pro",
    testid: "pricing-pro",
    price: "$9",
    period: "/mo",
    tag: "For working motion designers",
    features: ["Everything in Free", "Cloud library across devices", "Unlimited history", "Priority rule updates", "Import/export rule sets"],
    cta: "Coming soon",
    highlight: true,
  },
  {
    plan: "Team",
    testid: "pricing-team",
    price: "$29",
    period: "/mo",
    tag: "For studios",
    features: ["Everything in Pro", "Shared rule profiles", "Team preset library", "Studio-wide history", "Priority support"],
    cta: "Coming soon",
    highlight: false,
  },
];

export default function Marketing() {
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
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-28 grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
          <div className="animate-fade-up">
            <p data-testid="hero-eyebrow" className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-6">
              After Effects · preset · compatibility layer
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.03] tracking-tight text-slate-50">
              Ship a preset once.<br />
              <span className="text-slate-500">Run it on</span>{" "}
              <span className="text-amber-400">every AE version.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-400 leading-relaxed">
              Saturn analyzes After Effects presets, flags what breaks between versions, and hands you a compatibility package with concrete fallbacks — <span className="text-slate-200">not a black-box binary rewriter</span>.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/app"
                data-testid="hero-primary-cta"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold tracking-tight shadow-[0_0_28px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] transition-all"
              >
                Open converter <ArrowRight className="w-4 h-4" />
              </Link>
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
              <span><span className="text-amber-500">•</span> macOS + Windows</span>
              <span><span className="text-amber-500">•</span> No sign-up to try</span>
            </div>
          </div>

          {/* Report mock */}
          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative rounded-2xl bg-[#0C0E16] border border-[#232738] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#232738] bg-[#10121A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B3F55]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B3F55]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B3F55]" />
                <span className="ml-3 font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500">report.json · GlitchRig.xml → CC2018</span>
              </div>
              <pre className="font-mono-tech text-[12px] leading-relaxed text-slate-300 p-5 overflow-x-auto">
{`{
  "target": "CC2018 (macos)",
  "counts": {
    "compatible": 3,
    "flagged": 2,
    "fallback": 1,
    "manual_todo": 1
  },
  "findings": {
    "manual_todo": [
      { "rule": "roto-brush-2",
        "reason": "Introduced in CC2020" }
    ],
    "flagged": [
      { "rule": "shape-taper-wave",
        "fallback": "convert_to_stroke" }
    ]
  }
}`}
              </pre>
              <div className="border-t border-[#232738] px-5 py-4 flex items-center justify-between bg-[#0A0C12]">
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500">1 manual todo · 2 flagged</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-400"><PackageCheck className="w-3.5 h-3.5" /> package ready</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 rounded-lg border border-[#232738] bg-[#10121A] px-4 py-3 shadow-xl">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500">Rules engine</p>
              <p className="text-sm font-semibold text-slate-100">v1.0.0 · <span className="text-amber-400">{20}+ rules</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">03 steps</p>
        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl">
          Analyze first. <span className="text-slate-500">Migrate second.</span>
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
              No hype. No fake "AI" claims. A precise rule engine, a fast UI, and a report you can send to a client.
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

      {/* UPDATES */}
      <section id="updates" className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t border-[#232738]">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">Update log</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">Shipped recently</h2>
          </div>
          <span className="font-mono-tech text-xs text-slate-500 hidden md:block">v1.0.0 · live</span>
        </div>
        <div className="rounded-xl border border-[#232738] divide-y divide-[#232738] overflow-hidden">
          {updates.map((u, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 px-6 py-5 hover:bg-[#10121A]/60 transition-colors">
              <span className="font-mono-tech text-xs text-slate-500 md:w-32">{u.date}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono-tech text-[10px] uppercase tracking-[0.2em] md:w-24 justify-center">
                {u.tag}
              </span>
              <span className="text-sm text-slate-200">{u.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 lg:px-10 py-24 border-t border-[#232738]">
        <div className="flex flex-col items-start mb-14">
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">Pricing</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">Free while it's honest. Paid when it saves you a day.</h2>
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
              {p.ctaLink ? (
                <Link
                  to={p.ctaLink}
                  data-testid={`${p.testid}-cta`}
                  className={`mt-8 inline-flex w-full items-center justify-center h-11 rounded-md text-sm font-semibold transition-colors ${p.highlight ? "bg-amber-500 hover:bg-amber-400 text-slate-950" : "border border-[#343A52] hover:border-amber-500/50 hover:text-amber-300 text-slate-200"}`}
                >
                  {p.cta}
                </Link>
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
          Pro / Team billing ship in phase 2 · Free tier stays free
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
              <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight max-w-xl">Drop your first preset. Get a real report in under 30 seconds.</h3>
            </div>
            <Link
              to="/app"
              data-testid="cta-launch-band"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold tracking-tight shadow-[0_0_24px_rgba(245,158,11,0.4)] transition-all"
            >
              Launch converter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
