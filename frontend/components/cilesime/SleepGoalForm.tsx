"use client";

import { useCallback, useState } from "react";
import { ApiError, getSleepGoal, updateSleepGoal } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { cn } from "@/lib/cn";
import { Field, inputClass } from "@/components/common/Field";
import { LoadingBlock, ErrorState } from "@/components/common/States";

export default function SleepGoalForm({ bare = false }: { bare?: boolean }) {
  const [hours, setHours] = useState("8");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const apply = useCallback((g: { goal_minutes: number }) => {
    setHours(String(g.goal_minutes / 60));
  }, []);
  const { status, reload } = useGenLoad(getSleepGoal, apply);

  const hoursNum = Number(hours.trim().replace(",", "."));
  const valid = Number.isFinite(hoursNum) && hoursNum >= 1 && hoursNum <= 16;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateSleepGoal(Math.round(hoursNum * 60));
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        !bare && "rounded-2xl border border-border bg-surface p-5 sm:p-6",
      )}
    >
      <p className="text-xs text-text-lo">
        Synimi përdoret te faqja e Gjumit për të krahasuar mesataren e fundit.
      </p>

      {status === "loading" && <LoadingBlock lines={1} />}
      {status === "error" && (
        <ErrorState message="Synimi nuk u ngarkua." onRetry={reload} />
      )}
      {(status === "ready" || status === "refreshing") && (
        <form onSubmit={save} className="flex flex-col gap-3">
          <Field label="Synimi i gjumit (orë)">
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="1"
              max="16"
              value={hours}
              onChange={(e) => {
                setHours(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </Field>
          {error && <p className="text-[11px] text-danger">{error}</p>}
          {saved && !error && (
            <p className="text-[11px] text-accent">U ruajt.</p>
          )}
          <button
            type="submit"
            disabled={busy || !valid}
            className="flex h-[42px] items-center justify-center rounded-xl bg-accent px-4 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Duke ruajtur…" : "Ruaj"}
          </button>
        </form>
      )}
    </section>
  );
}
