"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  listExpenses,
  listIncome,
  listSleep,
  listHabits,
  listFitnessEntries,
  listWorkplaces,
} from "@/lib/api";

export type CountKey =
  | "expenses"
  | "income"
  | "sleep"
  | "habits"
  | "fitness"
  | "hr";

type Counts = Partial<Record<CountKey, number>>;

interface DataChange {
  key: CountKey;
  diff: number;
}

interface AddAction {
  label: string;
  run: () => void;
}

interface ShellValue {
  counts: Counts;
  refreshCounts: () => void;
  addAction: AddAction | null;
  setAddAction: (action: AddAction | null) => void;
}

const ShellCtx = createContext<ShellValue | null>(null);

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<Counts>({});
  const [addAction, setAddAction] = useState<AddAction | null>(null);

  const refreshCounts = useCallback(() => {
    listExpenses()
      .then((r) => setCounts((c) => ({ ...c, expenses: r.length })))
      .catch(() => undefined);
    listIncome()
      .then((r) => setCounts((c) => ({ ...c, income: r.length })))
      .catch(() => undefined);
    listSleep()
      .then((r) => setCounts((c) => ({ ...c, sleep: r.length })))
      .catch(() => undefined);
    listHabits()
      .then((r) => setCounts((c) => ({ ...c, habits: r.length })))
      .catch(() => undefined);
    listFitnessEntries()
      .then((r) => setCounts((c) => ({ ...c, fitness: r.length })))
      .catch(() => undefined);
    listWorkplaces()
      .then((r) =>
        setCounts((c) => ({
          ...c,
          hr: r.reduce((sum, w) => sum + w.contact_count, 0),
        })),
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshCounts();
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<DataChange | null>).detail;
      if (detail) {
        setCounts((c) => ({
          ...c,
          [detail.key]: Math.max(0, (c[detail.key] ?? 0) + detail.diff),
        }));
      } else {
        refreshCounts();
      }
    };
    window.addEventListener("rp-data-changed", onChange);
    return () => window.removeEventListener("rp-data-changed", onChange);
  }, [refreshCounts]);

  const value = useMemo(
    () => ({ counts, refreshCounts, addAction, setAddAction }),
    [counts, refreshCounts, addAction],
  );

  return <ShellCtx.Provider value={value}>{children}</ShellCtx.Provider>;
}

export function useShell(): ShellValue {
  const ctx = useContext(ShellCtx);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}

export function notifyDataChanged(change?: DataChange): void {
  window.dispatchEvent(
    new CustomEvent("rp-data-changed", { detail: change ?? null }),
  );
}

export function useRegisterAdd(label: string, run: () => void): void {
  const { setAddAction } = useShell();
  useEffect(() => {
    setAddAction({ label, run });
    return () => setAddAction(null);
  }, [label, run, setAddAction]);
}
