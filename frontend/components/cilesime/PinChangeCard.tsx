"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, changePin, storePin } from "@/lib/api";
import { IconLock } from "@/components/icons";

const PIN_RE = /^\d{4,8}$/;

export default function PinChangeCard() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setSuccess(null);

    if (!currentPin) {
      setError("Shkruaj PIN-in aktual.");
      return;
    }
    if (!PIN_RE.test(newPin) || !PIN_RE.test(confirmPin)) {
      setError("PIN-i i ri duhet të ketë 4–8 shifra.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("PIN-et e reja nuk përputhen.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await changePin(currentPin, newPin);
      storePin(newPin);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setSuccess("PIN u ndryshua.");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 401
            ? "PIN aktual i pasaktë"
            : err.message
          : "Ndryshimi dështoi.",
      );
    } finally {
      setBusy(false);
    }
  };

  const fieldClass =
    "h-[34px] w-full rounded-[9px] border border-white/[0.08] bg-[#131316] px-3 text-sm text-text-hi outline-none focus:border-accent/50 sm:w-[132px]";

  return (
    <section className="flex flex-col gap-3">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-lo">
        Siguri
      </span>
      <form
        onSubmit={submit}
        className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-[#0f0f12] p-5 sm:flex-row sm:items-center sm:gap-6"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#17171c] text-text-lo">
          <IconLock size={21} />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-display text-sm font-semibold text-text-hi">
            Ndrysho PIN-in
          </h3>
          <p className="text-[11.5px] text-text-lo">
            PIN aktual &rarr; PIN i ri &rarr; konfirmo.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="PIN aktual"
              className={fieldClass}
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="PIN i ri"
              className={fieldClass}
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Konfirmo PIN-in e ri"
              className={fieldClass}
            />
          </div>
          {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
          {success && !error && (
            <p className="mt-1 text-[11px] text-accent">{success}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={busy || !currentPin || !newPin || !confirmPin}
          className="h-9 shrink-0 self-start rounded-lg bg-accent px-4 text-[12px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50 sm:self-center"
        >
          {busy ? "Duke ruajtur…" : "Ruaj"}
        </button>
      </form>
    </section>
  );
}
