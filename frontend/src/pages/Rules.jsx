import React, { useEffect, useMemo, useState } from "react";
import { getRules } from "../lib/api";
import { FileCode, Search } from "lucide-react";

export default function Rules() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => { getRules().then(setData).catch(() => setData({ count: 0, rules: [] })); }, []);

  const categories = useMemo(() => {
    if (!data) return [];
    return ["all", ...Array.from(new Set(data.rules.map((r) => r.category)))];
  }, [data]);

  const filtered = (data?.rules || []).filter((r) => {
    const okCat = category === "all" || r.category === category;
    const okQ = !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.id.includes(q.toLowerCase());
    return okCat && okQ;
  });

  return (
    <div data-testid="rules-page" className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500">Rules Inspector</p>
          <h2 className="font-display text-2xl font-bold tracking-tight mt-1">Compatibility rule engine</h2>
          <p className="font-mono-tech text-[11px] text-slate-500 mt-1">
            {data ? `${data.rules.length} rules · ${data.version}` : "loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3" />
          <input
            data-testid="rules-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search rules…"
            className="h-10 pl-9 pr-3 rounded-md bg-[#10121A] border border-[#232738] focus:border-amber-500/50 focus:outline-none text-sm text-slate-100 placeholder:text-slate-600 w-64"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            data-testid={`rules-category-${c}`}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-md font-mono-tech text-[10px] uppercase tracking-widest transition-all ${
              category === c ? "bg-amber-500 text-slate-950 font-bold" : "border border-[#232738] text-slate-400 hover:border-amber-500/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <div key={r.id} data-testid={`rule-card-${r.id}`} className="rounded-xl border border-[#232738] bg-[#10121A] p-5 hover:border-amber-500/40 hover-lift">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500">{r.category}</p>
                <h3 className="font-display font-semibold text-slate-100 text-base tracking-tight mt-1">{r.title}</h3>
              </div>
              <span className="font-mono-tech text-[9px] px-2 py-0.5 rounded bg-[#141722] border border-[#232738] text-slate-400 shrink-0">
                {r.id}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">{r.notes}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip label={`intro · ${r.introduced_in}`} />
              <Chip label={`below → ${r.severity_below}`} tone={r.severity_below === "manual_todo" ? "red" : r.severity_below === "flagged" ? "amber" : "emerald"} />
              {r.fallback && <Chip label={`fallback: ${r.fallback}`} tone="blue" />}
              {r.os_target && <Chip label={`os · ${r.os_target}`} tone="amber" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ label, tone = "slate" }) {
  const map = {
    slate: "border-[#232738] text-slate-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    red: "border-red-500/30 bg-red-500/10 text-red-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border font-mono-tech text-[10px] uppercase tracking-widest ${map[tone]}`}>
      {label}
    </span>
  );
}
