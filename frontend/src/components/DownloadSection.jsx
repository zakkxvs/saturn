import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Apple, MonitorSmartphone, Download, Copy, Check, FileText } from "lucide-react";
import { getDownloads, downloadInstaller } from "../lib/api";

function fmtSize(n) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function osIcon(os) {
  return os === "macos" ? Apple : MonitorSmartphone;
}

export default function DownloadSection() {
  const [data, setData] = useState(null);
  const [busyOs, setBusyOs] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    getDownloads().then(setData).catch(() => setData({ builds: [], total_downloads: 0 }));
  }, []);

  // Detect the visitor's OS to highlight the primary CTA
  const detected = React.useMemo(() => {
    if (typeof navigator === "undefined") return "macos";
    const ua = navigator.userAgent || "";
    if (/Mac|iPhone|iPad|iPod/i.test(ua)) return "macos";
    if (/Windows/i.test(ua)) return "windows";
    return "macos";
  }, []);

  const trigger = async (osKey) => {
    setBusyOs(osKey);
    try {
      const { filename } = await downloadInstaller(osKey);
      toast.success(`Downloading ${filename}`);
      // refresh counters after a short delay
      setTimeout(() => getDownloads().then(setData).catch(() => {}), 800);
    } catch (e) {
      toast.error("Download failed — please retry.");
    } finally {
      setBusyOs(null);
    }
  };

  const copyHash = async (h, os) => {
    try {
      await navigator.clipboard.writeText(h);
      setCopied(os);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* clipboard blocked */ }
  };

  const builds = data?.builds || [];

  return (
    <section id="download" data-testid="download-section" className="relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 border-t border-[#232738]">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-amber-500 mb-4">Download</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.05]">
              Get Saturn <span className="text-slate-500">for</span> your machine.
            </h2>
            <p className="mt-5 text-sm sm:text-base text-slate-400 leading-relaxed max-w-md">
              Signed native builds for macOS and Windows. Bundled rules engine — works offline. Free while in beta.
            </p>
            {data && (
              <div className="mt-8 flex flex-wrap gap-6 font-mono-tech text-[10px] uppercase tracking-[0.24em] text-slate-500">
                <span><span className="text-amber-500">•</span> v{data.version}</span>
                <span><span className="text-amber-500">•</span> released {data.released}</span>
                <span data-testid="total-downloads">
                  <span className="text-amber-500">•</span> {data.total_downloads.toLocaleString()} downloads
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {builds.map((b) => {
              const Icon = osIcon(b.os);
              const isPrimary = b.os === detected;
              return (
                <div
                  key={b.os}
                  data-testid={`download-card-${b.os}`}
                  className={`rounded-2xl border p-6 lg:p-7 transition-all ${
                    isPrimary
                      ? "bg-[#141722] border-amber-500/40 shadow-[0_0_28px_rgba(245,158,11,0.10)]"
                      : "bg-[#10121A] border-[#232738]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                        isPrimary ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "bg-[#0C0E16] border-[#232738] text-slate-400"
                      }`}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-xl text-slate-100 tracking-tight">
                            Saturn for {b.label}
                          </h3>
                          {isPrimary && (
                            <span className="font-mono-tech text-[9px] uppercase tracking-[0.22em] bg-amber-500/20 text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded">
                              Detected
                            </span>
                          )}
                        </div>
                        <p className="font-mono-tech text-[11px] text-slate-500 mt-1.5 uppercase tracking-widest">
                          v{b.version} · {fmtSize(b.size_bytes)} · {b.arch}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Minimum: {b.min_version}</p>
                      </div>
                    </div>
                    <button
                      data-testid={`download-button-${b.os}`}
                      onClick={() => trigger(b.os)}
                      disabled={busyOs === b.os}
                      className={`inline-flex items-center gap-2 h-11 px-5 rounded-md text-sm font-semibold tracking-tight transition-all shrink-0 ${
                        isPrimary
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                          : "border border-[#343A52] hover:border-amber-500/50 hover:text-amber-300 text-slate-200"
                      } disabled:opacity-60`}
                    >
                      <Download className="w-4 h-4" />
                      {busyOs === b.os ? "Preparing…" : `Download .${b.ext}`}
                    </button>
                  </div>

                  <div className="mt-5 pt-5 border-t border-[#232738] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2 font-mono-tech min-w-0">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="uppercase tracking-widest text-slate-500 shrink-0">sha256</span>
                      <span data-testid={`sha256-${b.os}`} className="truncate text-slate-400">{b.sha256.slice(0, 32)}…</span>
                      <button
                        data-testid={`copy-sha-${b.os}`}
                        onClick={() => copyHash(b.sha256, b.os)}
                        className="ml-1 p-1 rounded hover:bg-[#141722] text-slate-500 hover:text-amber-300 shrink-0"
                        aria-label="copy sha256"
                      >
                        {copied === b.os ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="font-mono-tech uppercase tracking-widest" data-testid={`dl-count-${b.os}`}>
                      {b.download_count.toLocaleString()} installs
                    </span>
                  </div>
                </div>
              );
            })}

            <p className="pt-2 font-mono-tech text-[10px] text-slate-600 uppercase tracking-[0.22em] leading-relaxed">
              beta placeholder builds · real installers ship on release day · updates via built-in auto-updater
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
