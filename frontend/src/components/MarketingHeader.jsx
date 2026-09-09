import React from "react";
import { Link } from "react-router-dom";
import { Orbit, LogOut } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function MarketingHeader() {
  const { user, logout } = useAuth();
  return (
    <header
      data-testid="marketing-header"
      className="sticky top-0 z-40 backdrop-blur-xl bg-[#08090D]/75 border-b border-[#232738]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link
          to="/"
          data-testid="nav-logo-link"
          className="flex items-center gap-2 group"
        >
          <span className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_18px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_28px_rgba(245,158,11,0.55)] transition-all">
            <Orbit className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
          </span>
          <span className="font-display font-extrabold text-lg tracking-tight text-slate-100">
            Saturn<span className="text-amber-500">.</span>
          </span>
          <span className="hidden sm:inline font-mono-tech text-[10px] uppercase tracking-[0.24em] text-slate-500 ml-1">
            PresetBridge
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-mono-tech text-xs uppercase tracking-[0.18em] text-slate-400">
          <a data-testid="nav-features" href="#features" className="hover:text-amber-400 transition-colors">Features</a>
          <a data-testid="nav-how" href="#how-it-works" className="hover:text-amber-400 transition-colors">How it works</a>
          <a data-testid="nav-pricing" href="#pricing" className="hover:text-amber-400 transition-colors">Pricing</a>
          <a data-testid="nav-faq" href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span data-testid="nav-user-email" className="hidden sm:inline font-mono-tech text-[10px] uppercase tracking-[0.2em] text-slate-500 mr-1">
                {user.email}
              </span>
              <button
                data-testid="nav-logout-button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-[#343A52] hover:border-amber-500/50 hover:text-amber-300 text-xs text-slate-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
              <Link
                to="/app"
                data-testid="nav-launch-app-button"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold tracking-tight transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
              >
                Open app <span aria-hidden>→</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="nav-login-link"
                className="hidden sm:inline-flex items-center h-9 px-3 rounded-md text-xs text-slate-300 hover:text-amber-300 font-mono-tech uppercase tracking-[0.2em]"
              >
                Sign in
              </Link>
              <Link
                to="/app"
                data-testid="nav-launch-app-button"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold tracking-tight transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
              >
                Launch converter <span aria-hidden>→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
