import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import {
  UploadCloud, FileCode, FileJson, File as FileIcon, X, Sparkles,
  Check, AlertTriangle, ArrowDownToLine, Package, Wand2, Save, ChevronRight, Loader2,
} from "lucide-react";
import {
  convertPreset, downloadPackage, getSamples, getSample,
  savePreset,
} from "../lib/api";

const VERSIONS = ["CS6", "CC2014", "CC2018", "CC2020", "2022", "2024", "2025"];
const ALLOWED = [".ffx", ".xml", ".json"];

function extIcon(name = "") {
  const e = name.split(".").pop().toLowerCase();
  if (e === "json") return FileJson;
  if (e === "xml") return FileCode;
  return FileIcon;
}

function fileSize(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function Converter() {
  const { settings } = useOutletContext() || {};
  const [files, setFiles] = useState([]); // {file, id}
  const [target, setTarget] = useState("2024");
  const [os, setOs] = useState("macos");
  const [safe, setSafe] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]); // {id, filename, report}
  const [activeIdx, setActiveIdx] = useState(0);
  const [samples, setSamples] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (settings) {
      setTarget(settings.default_ae_version || "2024");
      setOs(settings.default_os || "macos");
    }
  }, [settings]);

  useEffect(() => {
    getSamples().then((r) => setSamples(r.samples || [])).catch(() => {});
  }, []);

  const addFiles = (list) => {
    const arr = Array.from(list).filter((f) => ALLOWED.some((e) => f.name.toLowerCase().endsWith(e)));
    if (!arr.length) {
      toast.error("Only .ffx, .xml, .json files are supported.");
      return;
    }
    setFiles((prev) => [...prev, ...arr.map((f) => ({ file: f, id: `${f.name}-${f.size}-${Math.random()}` }))]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const loadSample = async (sample) => {
    try {
      const s = await getSample(sample.id);
      const blob = new Blob([s.content], { type: "text/plain" });
      const file = new File([blob], s.filename);
      setFiles((prev) => [...prev, { file, id: `sample-${sample.id}-${Math.random()}` }]);
      toast.success(`Loaded sample: ${sample.label}`);
    } catch {
      toast.error("Could not load sample");
    }
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const runAnalyze = async () => {
    if (!files.length) {
      toast.error("Add a preset first.");
      return;
    }
    setRunning(true);
    setResults([]);
    try {
      const out = [];
      for (const { file } of files) {
        const r = await convertPreset({
          file,
          targetVersion: target,
          targetOs: os,
          safeConversion: safe,
          saveHistory: true,
        });
        out.push({ id: r.id, filename: file.name, report: r.report });
      }
      setResults(out);
      setActiveIdx(0);
      toast.success(`Analyzed ${out.length} preset${out.length > 1 ? "s" : ""}.`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Analysis failed");
    } finally {
      setRunning(false);
    }
  };

  const active = results[activeIdx];

  return (
    <div data-testid="converter-page" className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] px-5 py-3 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 mt-0.5" />
        <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
          <span className="font-semibold text-amber-300">Analyze & generate compatibility package.</span>{" "}
          Saturn does not rewrite binary <span className="font-mono-tech">.ffx</span> files — it inspects them, flags risks, and gives you a truthful migration plan.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6">
        {/* LEFT: input pane */}
        <div className="space-y-4">
          <div
            data-testid="preset-upload-dropzone"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
              dragOver ? "border-amber-500 bg-amber-500/10" : "border-[#343A52] bg-[#10121A] hover:border-amber-500/50"
            }`}
          >
            <UploadCloud className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-slate-200 font-medium">Drop presets or click to browse</p>
            <p className="mt-1 font-mono-tech text-[11px] uppercase tracking-[0.22em] text-slate-500">
              .ffx · .xml · .json · batch
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".ffx,.xml,.json"
              className="hidden"
              data-testid="preset-file-input"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {/* Sample loader */}
          <div className="rounded-xl border border-[#232738] bg-[#10121A] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500">Try a sample</p>
              <span className="text-[10px] font-mono-tech text-slate-600 uppercase tracking-widest">no upload needed</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {samples.map((s) => (
                <button
                  key={s.id}
                  data-testid={`sample-${s.id}`}
                  onClick={() => loadSample(s)}
                  className="text-left p-3 rounded-md border border-[#232738] hover:border-amber-500/50 bg-[#0C0E16] transition-colors group"
                >
                  <p className="text-sm text-slate-100 font-medium group-hover:text-amber-300">{s.label}</p>
                  <p className="font-mono-tech text-[10px] text-slate-500 mt-0.5">{s.filename}</p>
                </button>
              ))}
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="rounded-xl border border-[#232738] bg-[#10121A] divide-y divide-[#232738]" data-testid="file-list">
              {files.map(({ file, id }) => {
                const I = extIcon(file.name);
                return (
                  <div key={id} className="flex items-center gap-3 px-4 py-3">
                    <I className="w-4 h-4 text-slate-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100 truncate">{file.name}</p>
                      <p className="font-mono-tech text-[10px] uppercase tracking-widest text-slate-500">{fileSize(file.size)}</p>
                    </div>
                    <button
                      data-testid={`file-remove-${file.name}`}
                      onClick={() => removeFile(id)}
                      className="text-slate-500 hover:text-red-400"
                      aria-label="remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Target picker */}
          <div className="rounded-xl border border-[#232738] bg-[#10121A] p-5 space-y-5">
            <div>
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500 mb-3">Target AE version</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {VERSIONS.map((v) => (
                  <button
                    key={v}
                    data-testid={`target-version-${v}`}
                    onClick={() => setTarget(v)}
                    className={`h-9 rounded-md font-mono-tech text-xs uppercase tracking-widest transition-all ${
                      target === v ? "bg-amber-500 text-slate-950 font-bold" : "border border-[#232738] text-slate-300 hover:border-amber-500/40"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500 mb-3">Target OS</p>
                <div className="grid grid-cols-2 gap-2">
                  {["macos", "windows"].map((o) => (
                    <button
                      key={o}
                      data-testid={`target-os-${o}`}
                      onClick={() => setOs(o)}
                      className={`h-9 rounded-md text-xs font-medium uppercase tracking-wide transition-all ${
                        os === o ? "bg-amber-500 text-slate-950 font-bold" : "border border-[#232738] text-slate-300 hover:border-amber-500/40"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500 mb-3">Mode</p>
                <button
                  data-testid="safe-conversion-toggle"
                  onClick={() => setSafe((s) => !s)}
                  className={`w-full h-9 rounded-md text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-2 ${
                    safe ? "bg-amber-500 text-slate-950 font-bold" : "border border-[#232738] text-slate-300 hover:border-amber-500/40"
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  {safe ? "SAFE: apply fallbacks" : "STRICT: flag only"}
                </button>
              </div>
            </div>
          </div>

          <button
            data-testid="convert-now-button"
            onClick={runAnalyze}
            disabled={running || !files.length}
            className="w-full h-12 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold tracking-tight transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(245,158,11,0.25)]"
          >
            {running ? (<><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>) : (<><Sparkles className="w-4 h-4" /> Analyze {files.length || ""} preset{files.length > 1 ? "s" : ""}</>)}
          </button>
        </div>

        {/* RIGHT: report drawer */}
        <ReportDrawer results={results} active={active} activeIdx={activeIdx} setActiveIdx={setActiveIdx} files={files} />
      </div>
    </div>
  );
}

function ReportDrawer({ results, active, activeIdx, setActiveIdx, files }) {
  const [savingId, setSavingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [tab, setTab] = useState("all");

  const handleDownload = async (id) => {
    setDownloadingId(id);
    try {
      await downloadPackage(id);
      toast.success("Package downloaded");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!active) return;
    const fileEntry = files[activeIdx];
    if (!fileEntry) return;
    setSavingId(active.id);
    try {
      const buffer = await fileEntry.file.arrayBuffer();
      const b64 = arrayBufferToBase64(buffer);
      await savePreset({
        name: fileEntry.file.name,
        filename: fileEntry.file.name,
        content_b64: b64,
        tags: [active.report.summary.target_version],
        source_version: active.report.summary.source_version_detected,
        notes: "",
      });
      toast.success("Saved to Library");
    } catch {
      toast.error("Could not save");
    } finally {
      setSavingId(null);
    }
  };

  const findings = active?.report?.findings;
  const counts = active?.report?.summary?.counts || {};

  const filtered = useMemo(() => {
    if (!findings) return [];
    if (tab === "all") {
      return [
        ...findings.manual_todo.map((x) => ({ ...x, _sev: "manual_todo" })),
        ...findings.flagged.map((x) => ({ ...x, _sev: "flagged" })),
        ...findings.fallback.map((x) => ({ ...x, _sev: "fallback" })),
        ...findings.compatible.map((x) => ({ ...x, _sev: "compatible" })),
      ];
    }
    return (findings[tab] || []).map((x) => ({ ...x, _sev: tab }));
  }, [tab, findings]);

  if (!results.length) {
    return (
      <div data-testid="report-empty" className="rounded-xl border border-dashed border-[#232738] bg-[#0C0E16] p-10 flex flex-col items-center justify-center text-center min-h-[520px]">
        <Package className="w-8 h-8 text-slate-700 mb-4" />
        <p className="font-display text-lg text-slate-300 font-semibold">Report will appear here</p>
        <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
          Drop a preset, pick a target AE version, then run analysis. You'll get a categorized report and a downloadable compatibility package.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="report-drawer" className="rounded-xl border border-[#232738] bg-[#0C0E16] overflow-hidden flex flex-col min-h-[520px]">
      {results.length > 1 && (
        <div className="px-4 py-3 border-b border-[#232738] flex gap-2 overflow-x-auto">
          {results.map((r, i) => (
            <button
              key={r.id}
              data-testid={`report-tab-${i}`}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all font-mono-tech ${
                i === activeIdx ? "bg-amber-500 text-slate-950 font-bold" : "border border-[#232738] text-slate-400 hover:border-amber-500/40"
              }`}
            >
              {r.filename}
            </button>
          ))}
        </div>
      )}

      <div className="px-6 py-5 border-b border-[#232738]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500">Report</p>
            <h3 className="font-display font-bold text-slate-100 text-lg truncate">{active.report.summary.filename}</h3>
            <p className="font-mono-tech text-[11px] text-slate-500 mt-1">
              → {active.report.summary.target_version} / {active.report.summary.target_os} · source detected: <span className="text-slate-300">{active.report.summary.source_version_detected || "unknown"}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <MetricPill testid="metric-compatible" label="Compatible" value={counts.compatible} tone="emerald" />
          <MetricPill testid="metric-flagged" label="Flagged" value={counts.flagged} tone="amber" />
          <MetricPill testid="metric-fallback" label="Fallbacks" value={counts.fallback} tone="blue" />
          <MetricPill testid="metric-todo" label="Manual TODO" value={counts.manual_todo} tone="red" />
        </div>
      </div>

      <div className="px-6 pt-4 border-b border-[#232738] flex gap-1 flex-wrap">
        {[
          ["all", "All"],
          ["manual_todo", "Manual TODO"],
          ["flagged", "Flagged"],
          ["fallback", "Fallbacks"],
          ["compatible", "Compatible"],
        ].map(([k, l]) => (
          <button
            key={k}
            data-testid={`report-filter-${k}`}
            onClick={() => setTab(k)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-all ${
              tab === k ? "bg-[#10121A] text-amber-300 border border-b-0 border-[#232738]" : "text-slate-500 hover:text-slate-200"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto divide-y divide-[#232738]" data-testid="findings-list">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">Nothing in this category.</div>
        )}
        {filtered.map((f, i) => (
          <FindingRow key={`${f.rule_id}-${i}`} f={f} />
        ))}
      </div>

      <div className="px-6 py-4 border-t border-[#232738] flex flex-wrap gap-2 justify-end bg-[#08090D]">
        <button
          data-testid="save-to-library-button"
          onClick={handleSaveToLibrary}
          disabled={savingId === active.id}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-[#343A52] hover:border-amber-500/50 text-sm text-slate-200 disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {savingId === active.id ? "Saving…" : "Save to Library"}
        </button>
        <button
          data-testid="download-package-button"
          onClick={() => handleDownload(active.id)}
          disabled={downloadingId === active.id}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold disabled:opacity-60"
        >
          <ArrowDownToLine className="w-4 h-4" /> {downloadingId === active.id ? "Building…" : "Download package"}
        </button>
      </div>
    </div>
  );
}

function MetricPill({ label, value, tone, testid }) {
  const toneMap = {
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    red: "border-red-500/30 bg-red-500/10 text-red-300",
  };
  return (
    <div data-testid={testid} className={`rounded-md border px-3 py-2 ${toneMap[tone]}`}>
      <p className="font-mono-tech text-[9px] uppercase tracking-[0.22em] opacity-80">{label}</p>
      <p className="font-display font-extrabold text-2xl leading-none mt-1">{value}</p>
    </div>
  );
}

const SEV = {
  manual_todo: { label: "Manual TODO", icon: AlertTriangle, ring: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/20" },
  flagged: { label: "Flagged", icon: AlertTriangle, ring: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/25" },
  fallback: { label: "Fallback applied", icon: Wand2, ring: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/25" },
  compatible: { label: "Compatible", icon: Check, ring: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/25" },
};

function FindingRow({ f }) {
  const [open, setOpen] = useState(false);
  const meta = SEV[f._sev];
  const Icon = meta.icon;
  return (
    <div className={`px-6 py-4 ${meta.bg}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 text-left"
      >
        <Icon className={`w-4 h-4 mt-0.5 ${meta.ring}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-100 font-semibold">{f.title}</p>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500 mt-1">
            {f.category} · <span className={meta.ring}>{meta.label}</span>
          </p>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 pl-7 space-y-2">
          <p className="text-sm text-slate-300 leading-relaxed">{f.notes}</p>
          {f.fallback_applied && (
            <p className="font-mono-tech text-xs text-blue-300">Fallback: {f.fallback_applied}</p>
          )}
          {f.manual_steps?.length > 0 && (
            <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
              {f.manual_steps.map((s, i) => (<li key={i}>{s}</li>))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
