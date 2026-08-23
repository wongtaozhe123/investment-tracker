"use client";

import { ArrowRight, Fingerprint, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";

const Input = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon ? (
      <Icon
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
    ) : null}
    <input
      {...props}
      className={
        "w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm " +
        "placeholder:text-muted/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 " +
        (props.className || "")
      }
    />
  </div>
);

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  badge = "Passwordless",
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bg text-white">
      <div className="aurora" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck size={15} />
          </span>
          <span className="font-semibold tracking-tight text-white">Investment Tracker</span>
          <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
            {badge}
          </span>
        </div>

        <div className="grid flex-1 grid-cols-1 items-center gap-12 pt-10 lg:grid-cols-2">
          <section className="hidden flex-col gap-6 lg:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Welcome</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight">
                Track every position, in every market, from one calm dashboard.
              </h1>
              <p className="mt-4 max-w-md text-sm text-muted">
                Sign in with a passkey on this device. We never see your password,
                and your portfolio follows you across browsers the moment you sign in again.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-muted">
              {[
                { icon: Fingerprint, label: "Passkey first — no passwords to lose" },
                { icon: KeyRound, label: "Credentials are stored on your devices" },
                { icon: ShieldCheck, label: "Encrypted sync to your private MongoDB" },
              ].map(({ icon: I, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface2 text-primary">
                    <I size={15} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="glass rounded-xl2 p-8 shadow-2xl shadow-black/40">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                {subtitle ? (
                  <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
                ) : null}
              </div>
              {children}
            </div>
            {footer ? (
              <p className="mt-6 text-center text-xs text-muted">{footer}</p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

export function TextField({ icon, label, hint, error, ...props }) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      ) : null}
      <Input icon={icon} {...props} />
      {error ? (
        <span className="mt-1 block text-xs text-loss">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function PrimaryButton({
  children,
  loading = false,
  icon: Icon = ArrowRight,
  ...rest
}) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={
        "group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 " +
        "text-sm font-medium text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 " +
        "disabled:cursor-not-allowed disabled:opacity-60 " +
        (rest.className || "")
      }
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : null}
      {!loading && Icon ? <Icon size={15} /> : null}
      <span>{children}</span>
    </button>
  );
}

export function GhostButton({ children, icon: Icon, ...rest }) {
  return (
    <button
      {...rest}
      className={
        "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface " +
        "px-4 py-2.5 text-sm font-medium text-white transition hover:border-primary/60 hover:bg-surface2 " +
        "disabled:cursor-not-allowed disabled:opacity-60 " +
        (rest.className || "")
      }
    >
      {Icon ? <Icon size={15} /> : null}
      <span>{children}</span>
    </button>
  );
}

export { Input, Mail as MailIcon };