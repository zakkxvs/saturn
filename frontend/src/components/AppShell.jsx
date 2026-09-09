import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { Layers, Grid3x3, Clock, FileCode, Sliders, Orbit, ChevronLeft, Circle, LogIn, LogOut, User } from "lucide-react";
import FirstRunModal from "./FirstRunModal";
import { getSettings } from "../lib/api";
import { useAuth } from "../lib/auth";

const items = [
  { name: "Converter", to: "/app", icon: Layers, end: true, testid: "sidebar-converter-link" },
  { name: "Preset Library", to: "/app/library", icon: Grid3x3, testid: "sidebar-library-link" },
  { name: "History", to: "/app/history", icon: Clock, testid: "sidebar-history-link" },
  { name: "Rules Inspector", to: "/app/rules", icon: FileCode, testid: "sidebar-rules-link" },
  { name: "Settings", to: "/app/settings", icon: Sliders, testid: "sidebar-settings-link" },
];

export default function AppShell() {
  const [needsFirstRun, setNeedsFirstRun] = useState(false);
  const [settings, setSettings] = useState(null);
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    getSettings()
      .then((s) => {
        setSettings(s);
        if (!s.first_run_completed) setNeedsFirstRun(true);
      })
      .catch(() => {});
  }, []);

  const current = items.find((i) => (i.end ? loc.pathname === i.to : loc.pathname.startsWith(i.to)));

  return (
    <div className="min-h-screen flex bg-[#08090D]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-[#232738] bg-[#0A0C12]">
        <a href="/" data-testid="sidebar-home-link" className="h-16 border-b border-[#232738] flex items-center gap-3 px-5">
          <span className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
            <Orbit className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-slate-100 tracking-tight">Saturn.</span>
            <span className="font-mono-tech text-[9px] uppercase tracking-[0.22em] text-slate-500 mt-1">PresetBridge</span>
          </div>
        </a>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={it.testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                  isActive
                    ? "bg-[#141722] text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#10121A] border border-transparent"
                }`
              }
            >
              <it.icon className="w-4 h-4" />
              <span className="font-medium tracking-tight">{it.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[#232738]">
          <div className="rounded-lg border border-[#232738] bg-[#10121A] p-4">
            <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500 mb-2">Rules engine</p>
            <p className="font-mono-tech text-xs text-slate-300">v1.0.0</p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">Analyzes presets, produces compatibility packages. Does not rewrite .ffx binaries.</p>
          </div>
          <a href="/" className="mt-4 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-200 font-mono-tech uppercase tracking-[0.2em]">
            <ChevronLeft className="w-3 h-3" /> Marketing
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#232738] flex items-center justify-between px-6 lg:px-8 bg-[#08090D]/70 backdrop-blur">
          <div className="flex items-center gap-3">
            {current?.icon && <current.icon className="w-4 h-4 text-amber-400" />}
            <h1 className="font-display font-semibold tracking-tight text-slate-100">
              {current?.name ?? "Converter"}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-mono-tech text-slate-500 uppercase tracking-[0.2em]">
              <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" /> ready
            </span>
            {settings && (
              <span className="hidden sm:inline font-mono-tech text-slate-500 uppercase tracking-[0.2em]">
                target · {settings.default_ae_version} / {settings.default_os}
              </span>
            )}
            {user ? (
              <div className="flex items-center gap-2 pl-3 ml-1 border-l border-[#232738]">
                <span data-testid="appshell-user-email" className="hidden sm:inline-flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  <User className="w-3 h-3" /> {user.email}
                </span>
                <button
                  data-testid="appshell-logout-button"
                  onClick={async () => { await logout(); navigate("/"); }}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-[#343A52] hover:border-amber-500/50 hover:text-amber-300 text-xs text-slate-300"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                data-testid="appshell-signin-link"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#343A52] hover:border-amber-500/50 hover:text-amber-300 text-xs text-slate-300"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign in
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet context={{ settings, setSettings }} />
        </main>
      </div>

      {needsFirstRun && (
        <FirstRunModal
          onClose={(next) => {
            setNeedsFirstRun(false);
            if (next) setSettings(next);
          }}
        />
      )}
    </div>
  );
}
