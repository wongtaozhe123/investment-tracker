"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg text-muted">
      <Loader2 size={20} className="animate-spin" />
    </div>
  );
}