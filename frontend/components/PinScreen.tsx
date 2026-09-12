"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyPin, storePin, storeToken, ApiNetworkError } from "@/lib/api";
import EntrySidebar from "@/components/EntrySidebar";
import PinCard, { type PinStatus } from "@/components/PinCard";

const PIN_LENGTH = 4;

export default function PinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<PinStatus>("idle");
  const [errorKey, setErrorKey] = useState(0);
  const busy = useRef(false);

  const submit = useCallback(
    async (value: string) => {
      busy.current = true;
      setStatus("checking");
      try {
        const result = await verifyPin(value);
        if (result) {
          if (typeof result === "string") storeToken(result);
          storePin(value);
          router.replace("/panel");
          return;
        }
        setStatus("error");
        setErrorKey((k) => k + 1);
        setPin("");
      } catch (err) {
        setStatus(err instanceof ApiNetworkError ? "neterror" : "error");
        setErrorKey((k) => k + 1);
        setPin("");
      } finally {
        busy.current = false;
      }
    },
    [router],
  );

  const handleDigit = useCallback((digit: string) => {
    if (busy.current) return;
    setStatus((s) => (s === "error" || s === "neterror" ? "idle" : s));
    setPin((prev) => (prev.length >= PIN_LENGTH ? prev : prev + digit));
  }, []);

  const handleBackspace = useCallback(() => {
    if (busy.current) return;
    setStatus((s) => (s === "error" || s === "neterror" ? "idle" : s));
    setPin((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    if (pin.length === PIN_LENGTH && !busy.current) {
      void submit(pin);
    }
  }, [pin, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDigit, handleBackspace]);

  return (
    <main className="relative flex min-h-screen w-full overflow-hidden bg-bg text-text-hi">
      <div
        aria-hidden="true"
        className="entry-ambient pointer-events-none absolute inset-0"
      />

      <EntrySidebar />

      <section className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-6">
        <PinCard
          filled={pin.length}
          total={PIN_LENGTH}
          status={status}
          errorKey={errorKey}
          onDigit={handleDigit}
          onBackspace={handleBackspace}
        />
      </section>
    </main>
  );
}
