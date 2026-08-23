"use client";

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Fingerprint, ShieldCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function LoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('webauthn', {
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.error) {
        setError('Sign-in failed. Please try again.');
      } else {
        router.push('/');
      }
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-primary to-primary/70 px-6 py-4 text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <span className="relative flex items-center justify-center gap-3">
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Fingerprint size={20} />
          )}
          <span className="font-medium tracking-wide">
            {loading ? 'Waiting for passkey…' : 'Sign in with passkey'}
          </span>
        </span>
      </button>

      <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs text-white/60">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-gain" />
        <p>
          New here? Your passkey will be registered automatically — no password
          needed.
        </p>
      </div>

      {error && (
        <p className="text-center text-sm text-loss">{error}</p>
      )}
    </div>
  );
}
