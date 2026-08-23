"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Fingerprint, Loader2, Lock, Mail, ShieldAlert, User } from "lucide-react";
import { AuthShell, PrimaryButton, TextField, GhostButton } from "@/components/auth/AuthShell";
import { useWebAuthn } from "@/components/auth/useWebAuthn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [form, setForm] = useState({ name: "", email: "" });
  const [touched, setTouched] = useState({ name: false, email: false });
  const [step, setStep] = useState("form");
  const { register, status, error, reset } = useWebAuthn();

  useEffect(() => {
    if (sessionStatus === "authenticated") router.replace("/dashboard");
  }, [sessionStatus, router]);

  useEffect(() => {
    if (status === "registered") {
      setStep("done");
      const t = setTimeout(() => router.replace("/login"), 1200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [status, router]);

  const nameError = touched.name && form.name.trim().length < 2 ? "Name should be at least 2 characters" : null;
  const emailError = touched.email && !EMAIL_RE.test(form.email.trim()) ? "Enter a valid email address" : null;
  const isWorking = status === "registering";
  const canSubmit = form.name.trim().length >= 2 && EMAIL_RE.test(form.email.trim());

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    reset();
    if (!canSubmit) return;
    setStep("passkey");
    await register(form.email.trim());
  };

  if (step === "done") {
    return (
      <AuthShell
        title="Passkey saved"
        subtitle="You are ready to sign in. Redirecting you now..."
        badge="Account created"
      >
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gain/15 text-gain">
            <CheckCircle2 size={28} />
          </div>
          <p className="text-sm text-muted">
            Keep this device safe — your passkey is what unlocks your portfolio.
          </p>
          <Loader2 size={16} className="animate-spin text-muted" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="A passkey replaces the password. We never store a password to lose."
      footer={<>Already onboard? <Link className="text-primary hover:underline" href="/login">Sign in instead</Link>.</>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          icon={User}
          label="Display name"
          autoComplete="name"
          autoFocus
          required
          placeholder="Jordan Tan"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={nameError}
        />
        <TextField
          icon={Mail}
          type="email"
          inputMode="email"
          label="Email address"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={emailError}
          hint="Your passkey is bound to this address. Use it again on the login screen."
        />

        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-loss/40 bg-loss/10 px-3 py-2 text-xs text-loss">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <PrimaryButton type="submit" loading={isWorking} icon={Fingerprint}>
          {isWorking ? "Registering passkey..." : "Create passkey & account"}
        </PrimaryButton>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-3 text-[10px] uppercase tracking-wider text-muted">security</span>
          </div>
        </div>

        <ul className="space-y-2 text-xs text-muted">
          <li className="flex items-center gap-2">
            <Lock size={12} className="text-primary" />
            Your passkey stays on this device — we never see it.
          </li>
          <li className="flex items-center gap-2">
            <Fingerprint size={12} className="text-primary" />
            Use Touch ID, Face ID, Windows Hello, or a hardware security key.
          </li>
        </ul>
      </form>
    </AuthShell>
  );
}