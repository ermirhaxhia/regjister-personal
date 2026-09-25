"use client";

import { Fragment, useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import {
  getCorrelations,
  type CorrelationCell,
  type CorrelationCol,
  type CorrelationRow,
  type CorrelationsRead,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import { IconSpark } from "@/components/icons";

const ROWS: { key: CorrelationRow; label: string }[] = [
  { key: "energy", label: "Energjia (nesër)" },
  { key: "mood", label: "Humori (nesër)" },
  { key: "expense_next", label: "Shpenzim (nesër)" },
  { key: "habit_rate", label: "Zakone % (nesër)" },
];

const COLS: { key: CorrelationCol; label: string }[] = [
  { key: "sleep", label: "Gjumi (sot)" },
  { key: "work_hours", label: "Orë pune (sot)" },
  { key: "expense", label: "Shpenzim (sot)" },
];

function findCell(
  cells: CorrelationCell[],
  row: CorrelationRow,
  col: CorrelationCol,
): CorrelationCell | undefined {
  return cells.find((c) => c.row === row && c.col === col);
}

function cellTone(rho: number): { bg: string; border: string; text: string } {
  const intensity = Math.min(Math.abs(rho), 1);
  if (rho >= 0) {
    return {
      bg: `rgba(139, 123, 255, ${0.08 + intensity * 0.28})`,
      border: "border-accent-2/35",
      text: "text-accent-2",
    };
  }
  return {
    bg: `rgba(255, 91, 91, ${0.08 + intensity * 0.28})`,
    border: "border-danger/35",
    text: "text-danger",
  };
}

function MatrixCell({ cell }: { cell: CorrelationCell | undefined }) {
  if (!cell) {
    return (
      <div className="flex h-[72px] flex-col items-center justify-center rounded-[12px] border border-border bg-surface-2/40 text-text-lo">
        <span className="text-[13px]">—</span>
        <span className="text-[10px]">pak të dhëna</span>
      </div>
    );
  }

  const tone = cellTone(cell.rho);

  return (
    <div
      className={cn(
        "flex h-[72px] flex-col items-center justify-center gap-0.5 rounded-[12px] border",
        tone.border,
      )}
      style={{ backgroundColor: tone.bg }}
    >
      <span className={cn("flex items-center gap-1 font-mono text-[15px] font-semibold", tone.text)}>
        {cell.rho.toFixed(2)}
        {cell.significant && <IconSpark size={12} />}
      </span>
      <span className="text-[10px] text-text-lo">n={cell.n}</span>
    </div>
  );
}

export default function CorrelationMatrix() {
  const [data, setData] = useState<CorrelationsRead | null>(null);

  const fetchCorrelations = useCallback(() => getCorrelations(), []);
  const applyCorrelations = useCallback(
    (d: CorrelationsRead) => setData(d),
    [],
  );
  const { status, reload } = useGenLoad(fetchCorrelations, applyCorrelations);

  const ready = status === "ready" || status === "refreshing";
  const cells = data?.cells ?? [];
  const empty = ready && cells.length === 0;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[16px] font-semibold text-text-hi">
          Korrelacione me vonesë
        </h2>
        <p className="text-[13px] text-text-lo">
          Lidhja mes një variabli sot dhe një tjetri nesër, me korrigjim
          statistikor Benjamini–Hochberg.
        </p>
      </div>

      {status === "loading" && <LoadingBlock lines={3} />}

      {status === "error" && (
        <ErrorState
          message="Korrelacionet nuk u ngarkuan. Kontrollo lidhjen me serverin."
          onRetry={reload}
        />
      )}

      {empty && (
        <div className="py-6">
          <EmptyState
            title="Ende pa mjaftueshëm ditë të mbivendosura"
            hint="Nevojiten të paktën 30 ditë me të dhëna të mbivendosura (humor, gjumë, punë, shpenzime) — matrica shfaqet automatikisht kur të grumbullohen."
          />
        </div>
      )}

      {ready && !empty && (
        <div className="overflow-x-auto rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-5">
          <div
            className="grid min-w-[520px] gap-2"
            style={{
              gridTemplateColumns: `160px repeat(${COLS.length}, minmax(0, 1fr))`,
            }}
          >
            <div />
            {COLS.map((col) => (
              <div
                key={col.key}
                className="px-1 text-center text-[11px] font-medium text-text-mid"
              >
                {col.label}
              </div>
            ))}

            {ROWS.map((row) => (
              <Fragment key={row.key}>
                <div className="flex items-center pr-2 text-[12px] text-text-mid">
                  {row.label}
                </div>
                {COLS.map((col) => (
                  <MatrixCell
                    key={`${row.key}-${col.key}`}
                    cell={findCell(cells, row.key, col.key)}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
