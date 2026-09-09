import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Orbit, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../lib/auth";
import { formatApiError } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.from || "/app";

  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user, navigate, redirect]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back.");
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(formatApiError(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Access your Preset Library and history.">
      <form onSubmit={submit} className="space-y-4" data-testid="login-form">
        <FieldEmail value={email} onChange={setEmail} testid="login-email-input" />
        <FieldPassword value={password} onChange={setPassword} testid="login-password-input" />
        <button
          data-testid="login-submit-button"
          disabled={busy}
          className="w-full h-11 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-semibold flex items-center justify-center gap-2"
        >
          {busy ? "Signing in…" : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-500 text-center">
        No account?{" "}
        <Link to="/register" data-testid="login-to-register-link" className="text-amber-400 hover:text-amber-300 font-medium">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 grid-backdrop opacity-30 pointer-events-none" />
      <div
        className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full opacity-25 animate-drift pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(245,158,11,0.5), rgba(255,107,0,0.1), transparent)" }}
      />
      <div className="relative w-full max-w-md">
        <Link to="/" data-testid="auth-home-link" className="flex items-center gap-2 mb-8">
          <span className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
            <Orbit className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
          </span>
          <span className="font-display font-extrabold text-slate-100">Saturn<span className="text-amber-500">.</span></span>
        </Link>
        <div className="rounded-2xl border border-[#232738] bg-[#0C0E16] p-8 shadow-2xl">
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-amber-500 mb-2">{title === "Sign in" ? "Welcome back" : "Get started"}</p>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FieldEmail({ value, onChange, testid }) {
  return (
    <label className="block">
      <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-2 block">Email</span>
      <div className="relative">
        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="email"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="you@studio.com"
          data-testid={testid}
          className="w-full h-11 pl-9 pr-3 rounded-md bg-[#10121A] border border-[#232738] focus:border-amber-500/60 focus:outline-none text-sm text-slate-100 placeholder:text-slate-600 transition-colors"
        />
      </div>
    </label>
  );
}

export function FieldPassword({ value, onChange, testid, minLen = 1 }) {
  return (
    <label className="block">
      <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-2 block">Password</span>
      <div className="relative">
        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="password"
          required
          minLength={minLen}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          data-testid={testid}
          className="w-full h-11 pl-9 pr-3 rounded-md bg-[#10121A] border border-[#232738] focus:border-amber-500/60 focus:outline-none text-sm text-slate-100 placeholder:text-slate-600 transition-colors"
        />
      </div>
    </label>
  );
}
