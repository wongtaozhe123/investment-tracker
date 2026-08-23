"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ShieldCheck } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard#holdings", label: "Holdings" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const email = session?.user?.email || "guest";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck size={16} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Investment Tracker</p>
            <p className="text-[11px] text-muted">{email}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface px-1 py-1 text-xs md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href.split("#")[0];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-full px-3 py-1.5 transition " +
                  (active
                    ? "bg-primary/15 text-primary"
                    : "text-muted hover:bg-surface2 hover:text-white")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted transition hover:border-primary/50 hover:text-white"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </header>
  );
}