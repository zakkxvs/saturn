import React, { useEffect, useState } from "react";
import { listPresets, deletePreset } from "../lib/api";
import { toast } from "sonner";
import { FileCode, FileJson, File as FileIcon, Trash2, Tag } from "lucide-react";

export default function Library() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState("");

  const load = () => listPresets().then((r) => setItems(r.items)).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const filtered = (items || []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const handleDelete = async (id) => {
    try {
      await deletePreset(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Preset removed");
    } catch { toast.error("Could not remove"); }
  };

  return (
    <div data-testid="library-page" className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500">Preset Library</p>
          <h2 className="font-display text-2xl font-bold tracking-tight mt-1">Your saved presets</h2>
        </div>
        <input
          data-testid="library-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="h-10 px-3 rounded-md bg-[#10121A] border border-[#232738] focus:border-amber-500/50 focus:outline-none text-sm text-slate-100 placeholder:text-slate-600 w-64"
        />
      </div>

      {items === null && (
        <div className="text-sm text-slate-500 font-mono-tech uppercase tracking-[0.2em]">Loading…</div>
      )}
      {items && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#232738] bg-[#0C0E16] p-14 text-center">
          <FileCode className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No saved presets yet</p>
          <p className="text-xs text-slate-500 mt-2">Save from the Converter's report drawer to build your library.</p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const ext = (p.filename || "").split(".").pop().toLowerCase();
          const Icon = ext === "json" ? FileJson : ext === "xml" ? FileCode : FileIcon;
          return (
            <div key={p.id} data-testid={`library-card-${p.id}`} className="hover-lift rounded-xl border border-[#232738] bg-[#10121A] p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <Icon className="w-5 h-5 text-amber-400" />
                <button
                  data-testid={`library-delete-${p.id}`}
                  onClick={() => handleDelete(p.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-4 font-semibold text-slate-100 truncate">{p.name}</p>
              <p className="font-mono-tech text-[10px] uppercase tracking-widest text-slate-500 mt-1 truncate">{p.filename}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(p.tags || []).map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 font-mono-tech text-[10px] text-amber-300 uppercase tracking-widest">
                    <Tag className="w-2.5 h-2.5" /> {t}
                  </span>
                ))}
              </div>
              <p className="mt-auto pt-4 font-mono-tech text-[10px] text-slate-600 uppercase tracking-widest">
                {new Date(p.created_at).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
