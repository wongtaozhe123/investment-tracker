"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Fingerprint, KeyRound, Loader2, Mail, ShieldAlert } from "lucide-react";
import { AuthShell, PrimaryButton, TextField, GhostButton } from "@/components/auth/AuthShell";
import { useWebAuthn } from "@/components/auth/useWebAuthn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const { login, status, error, reset } = useWebAuthn();

  useEffect(() => {
    if (sessionStatus === "authenticated") router.replace("/dashboard");
  }, [sessionStatus, router]);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const emailError = touched && !EMAIL_RE.test(email.trim()) ? "Enter a valid email address" : null;
  const isWorking = status === "authenticating";

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    reset();
    if (!EMAIL_RE.test(email.trim())) return;
    await login(email.trim());
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with the passkey you created on this device."
      footer={<>By signing in you agree to our fair-use terms. Need an account? <Link className="text-primary hover:underline" href="/register">Create one</Link>.</>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          icon={Mail}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          required
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={emailError}
        />

        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-loss/40 bg-loss/10 px-3 py-2 text-xs text-loss">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <PrimaryButton type="submit" loading={isWorking} icon={Fingerprint}>
          {isWorking ? "Waiting for passkey..." : "Continue with passkey"}
        </PrimaryButton>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-3 text-[10px] uppercase tracking-wider text-muted">or</span>
          </div>
        </div>

        <Link href="/register" className="block">
          <GhostButton type="button" icon={KeyRound}>Create a new passkey</GhostButton>
        </Link>
      </form>
    </AuthShell>
  );
}