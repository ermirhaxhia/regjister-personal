"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";
import PinScreen from "@/components/PinScreen";

export default function Home() {
  const router = useRouter();
  const { pin, mounted } = useSession();

  useEffect(() => {
    if (mounted && pin) {
      router.replace("/panel");
    }
  }, [mounted, pin, router]);

  if (!mounted || pin) {
    return <div className="min-h-screen bg-bg" />;
  }

  return <PinScreen />;
}
