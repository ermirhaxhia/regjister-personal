"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearPin } from "@/lib/api";
import { useSession } from "@/lib/useSession";
import { ShellProvider } from "@/components/shell/ShellContext";
import Sidebar from "@/components/shell/Sidebar";
import MobileNav from "@/components/shell/MobileNav";

const STORAGE_KEY = "rp_sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { pin, mounted } = useSession();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    if (mounted && !pin) router.replace("/");
  }, [mounted, pin, router]);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    clearPin();
    router.replace("/");
  }, [router]);

  if (!mounted || !pin) {
    return <div className="min-h-dvh bg-bg" />;
  }

  return (
    <ShellProvider>
      <div className="flex h-dvh w-full max-w-[100vw] overflow-hidden bg-bg text-text-hi">
        <Sidebar collapsed={collapsed} onToggle={toggle} onLogout={logout} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <MobileNav onLogout={logout} />
          <main className="min-w-0 w-full flex-1">{children}</main>
        </div>
      </div>
    </ShellProvider>
  );
}
