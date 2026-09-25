"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { inputClass } from "@/components/common/Field";
import { todayISO } from "@/lib/date";
import {
  ApiError,
  createExpense,
  listExpenseCategories,
  listExpenses,
  type ExpenseCategory,
} from "@/lib/api";

export default function QuickAddExpensePage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(0);
  const amountRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [cats, recent] = await Promise.all([
          listExpenseCategories(),
          listExpenses().catch(() => []),
        ]);
        if (cancelled) return;
        setCategories(cats);
        const lastUsed = recent[0]?.category;
        if (lastUsed && cats.some((c) => c.name === lastUsed)) {
          setCategory(lastUsed);
        } else if (cats.length > 0) {
          setCategory(cats[0].name);
        }
      } catch {
        // gjendja bosh/gabim trajtohet nga select-i pa opsione
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(0), 1500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const normalized = amount.trim().replace(",", ".");
  const amountNum = Number(normalized);
  const amountValid = /^\d+(\.\d{1,2})?$/.test(normalized) && amountNum > 0;
  const valid = amountValid && category.trim().length > 0;

  const focusAmount = useCallback(() => {
    amountRef.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createExpense({
        amount: amountNum,
        category: category.trim(),
        entry_date: todayISO(),
        description: description.trim() || null,
      });
      sessionStorage.setItem("rp_summary_stale", "1");
      setAmount("");
      setDescription("");
      setSavedAt(Date.now());
      focusAmount();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        <Link
          href="/panel/shpenzime"
          className="text-xs text-text-lo transition-colors hover:text-text-hi"
        >
          ← Shpenzimet
        </Link>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            ref={amountRef}
            type="text"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-6 text-center font-display text-5xl text-text-hi outline-none transition-colors placeholder:text-text-lo focus:border-accent/60"
          />

          {categories.length > 0 ? (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-center text-xs text-text-lo">
              Nuk ka kategori ende — shtoje një te faqja e shpenzimeve.
            </p>
          )}

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Përshkrim (opsional)"
            className={inputClass}
          />

          {error && <p className="text-center text-[12px] text-danger">{error}</p>}

          <button
            type="submit"
            disabled={!valid || busy}
            className="w-full rounded-xl bg-accent px-4 py-4 text-base font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Duke ruajtur…" : "Ruaj"}
          </button>

          <div className="h-5 text-center text-sm text-success">
            {savedAt ? "✓ U shtua" : ""}
          </div>
        </form>
      </div>
    </div>
  );
}
