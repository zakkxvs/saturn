import React, { useEffect, useState } from "react";
import { getHistory, deleteHistoryItem, downloadPackage } from "../lib/api";
import { toast } from "sonner";
import { Clock, Trash2, ArrowDownToLine, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function History() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    getHistory().then((r) => setItems(r.items)).catch(() => setItems([]));
  }, []);

  const remove = async (id) => {
    try {
      await deleteHistoryItem(id);
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Removed from history");
    } catch { toast.error("Could not remove"); }
  };

  const download = async (id) => {
    try { await downloadPackage(id); }
    catch { toast.error("Download failed"); }
  };

  return (
    <div data-testid="history-page" className="space-y-6">
      <div>
        <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500">History</p>
        <h2 className="font-display text-2xl font-bold tracking-tight mt-1">Conversion timeline</h2>
      </div>
      {items === null && <div className="font-mono-tech text-xs text-slate-500 uppercase tracking-widest">Loading…</div>}
      {items && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#232738] bg-[#0C0E16] p-14 text-center">
          <Clock className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No conversions yet</p>
          <p className="text-xs text-slate-500 mt-2">Every analysis you run shows up here.</p>
        </div>
      )}
      <div className="rounded-xl border border-[#232738] divide-y divide-[#232738] bg-[#10121A] overflow-hidden">
        {(items || []).map((h) => {
          const c = h.report?.summary?.counts || {};
          const bad = (c.manual_todo || 0) + (c.flagged || 0);
          return (
            <div key={h.id} data-testid={`history-row-${h.id}`} className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 hover:bg-[#141722]/60 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-100 font-semibold truncate">{h.filename}</p>
                <p className="font-mono-tech text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">
                  → {h.target_version} / {h.target_os} · {new Date(h.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {bad === 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> clean
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
                    <ShieldAlert className="w-3.5 h-3.5" /> {bad} issue{bad > 1 ? "s" : ""}
                  </span>
                )}
                <button
                  data-testid={`history-download-${h.id}`}
                  onClick={() => download(h.id)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-[#343A52] hover:border-amber-500/50 text-xs text-slate-200"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" /> Package
                </button>
                <button
                  data-testid={`history-delete-${h.id}`}
                  onClick={() => remove(h.id)}
                  className="h-9 w-9 rounded-md border border-[#343A52] flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-500/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
