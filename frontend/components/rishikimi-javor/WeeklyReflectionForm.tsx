"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  getWeeklyReview,
  upsertWeeklyReview,
  type WeeklyReviewInput,
} from "@/lib/api";

type FieldKey = "good" | "bad" | "next";

const FIELDS: { key: FieldKey; label: string; placeholder: string }[] = [
  { key: "good", label: "Çfarë shkoi mirë?", placeholder: "Shkruaj një ose dy fjali…" },
  { key: "bad", label: "Çfarë jo?", placeholder: "Shkruaj një ose dy fjali…" },
  { key: "next", label: "Një gjë për javën tjetër", placeholder: "Shkruaj një ose dy fjali…" },
];

export default function WeeklyReflectionForm({ weekStart }: { weekStart: string }) {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    good: "",
    bad: "",
    next: "",
  });
  const [saved, setSaved] = useState<Record<FieldKey, string>>({
    good: "",
    bad: "",
    next: "",
  });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setReady(false);
    setError(null);
    try {
      const review = await getWeeklyReview(weekStart);
      const next = {
        good: review.good ?? "",
        bad: review.bad ?? "",
        next: review.next ?? "",
      };
      setValues(next);
      setSaved(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        const empty = { good: "", bad: "", next: "" };
        setValues(empty);
        setSaved(empty);
      } else {
        setError("S'u ngarkua dot rishikimi");
      }
    } finally {
      setReady(true);
    }
  }, [weekStart]);

  useEffect(() => {
    void load();
  }, [load]);

  const commit = async (key: FieldKey) => {
    const trimmed = values[key].trim();
    if (saved[key] === trimmed) return;
    setError(null);
    try {
      const body: WeeklyReviewInput = { [key]: trimmed || null };
      const result = await upsertWeeklyReview(weekStart, body);
      setSaved({
        good: result.good ?? "",
        bad: result.bad ?? "",
        next: result.next ?? "",
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    }
  };

  return (
    <div className="rp-card rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
      <h2 className="font-display text-sm font-semibold text-text-hi">Reflektim</h2>
      {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-medium text-text-mid">
              {field.label}
            </label>
            <textarea
              value={values[field.key]}
              disabled={!ready}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              onBlur={() => void commit(field.key)}
              placeholder={field.placeholder}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text-hi outline-none placeholder:text-text-lo/60 focus:border-accent/50 disabled:opacity-50"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
