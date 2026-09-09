import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, User } from "lucide-react";
import { useAuth } from "../lib/auth";
import { formatApiError } from "../lib/api";
import { AuthLayout, FieldEmail, FieldPassword } from "./Login";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await register(email.trim(), password, name.trim() || null);
      toast.success("Account created. Welcome to Saturn.");
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error(formatApiError(err, "Could not create account"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Free forever tier. No credit card. Cancel anytime.">
      <form onSubmit={submit} className="space-y-4" data-testid="register-form">
        <label className="block">
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-2 block">Display name (optional)</span>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              data-testid="register-name-input"
              className="w-full h-11 pl-9 pr-3 rounded-md bg-[#10121A] border border-[#232738] focus:border-amber-500/60 focus:outline-none text-sm text-slate-100 placeholder:text-slate-600 transition-colors"
            />
          </div>
        </label>
        <FieldEmail value={email} onChange={setEmail} testid="register-email-input" />
        <FieldPassword value={password} onChange={setPassword} testid="register-password-input" minLen={8} />
        <p className="font-mono-tech text-[10px] text-slate-600 uppercase tracking-[0.2em]">min 8 characters</p>
        <button
          data-testid="register-submit-button"
          disabled={busy}
          className="w-full h-11 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-semibold flex items-center justify-center gap-2"
        >
          {busy ? "Creating…" : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-500 text-center">
        Already have one?{" "}
        <Link to="/login" data-testid="register-to-login-link" className="text-amber-400 hover:text-amber-300 font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
