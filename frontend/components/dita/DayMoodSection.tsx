"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ApiError, getMood, upsertMood, deleteMood, type Mood } from "@/lib/api";
import { IconSpark } from "@/components/icons";
import DaySection from "@/components/dita/DaySection";

const SCALE = [1, 2, 3, 4, 5];

function ScaleRow({
  label,
  value,
  onPick,
  disabled,
}: {
  label: string;
  value: number | null;
  onPick: (n: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-text-hi">{label}</span>
      <div className="flex gap-1.5">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onPick(n)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[12px] transition-colors",
              value === n
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-text-lo hover:border-accent/40 hover:text-text-hi",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DayMoodSection({ date }: { date: string }) {
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setReady(false);
    setError(null);
    try {
      const m = await getMood(date);
      setMood(m);
      setNote(m.note ?? "");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setMood(null);
        setNote("");
      } else {
        setError("S'u ngarkua dot");
      }
    } finally {
      setReady(true);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (
    patch: Partial<{ mood: number; energy: number; note: string | null }>,
  ) => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        mood: patch.mood ?? mood?.mood ?? 3,
        energy: patch.energy ?? mood?.energy ?? 3,
        note: patch.note !== undefined ? patch.note : (mood?.note ?? null),
      };
      const result = await upsertMood(date, body);
      setMood(result);
      setNote(result.note ?? "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    setSaving(true);
    setError(null);
    try {
      await deleteMood(date);
      setMood(null);
      setNote("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Fshirja dështoi");
    } finally {
      setSaving(false);
    }
  };

  const commitNote = () => {
    const trimmed = note.trim();
    if ((mood?.note ?? "") === trimmed) return;
    if (!mood && !trimmed) return;
    void save({ note: trimmed || null });
  };

  return (
    <DaySection icon={IconSpark} title="Humor dhe Energji" accent="orange" isEmpty={false}>
      <div className="flex flex-col gap-3 px-4 py-3">
        {!ready ? (
          <p className="text-xs text-text-lo">Duke u ngarkuar…</p>
        ) : (
          <>
            {error && <p className="text-[12px] text-danger">{error}</p>}
            <ScaleRow
              label="Humori"
              value={mood?.mood ?? null}
              disabled={saving}
              onPick={(n) => void save({ mood: n })}
            />
            <ScaleRow
              label="Energjia"
              value={mood?.energy ?? null}
              disabled={saving}
              onPick={(n) => void save({ energy: n })}
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={commitNote}
              disabled={saving || !mood}
              placeholder={
                mood ? "Shënim (opsional)" : "Zgjidh humorin dhe energjinë më parë"
              }
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text-hi outline-none placeholder:text-text-lo/60 focus:border-accent/50 disabled:opacity-50"
            />
            {mood && (
              <button
                type="button"
                onClick={() => void clear()}
                disabled={saving}
                className="self-start text-[12px] text-text-lo hover:text-danger"
              >
                Fshi check-in-in e sotëm
              </button>
            )}
          </>
        )}
      </div>
    </DaySection>
  );
}
