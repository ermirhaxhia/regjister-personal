"use client";

import { useCallback, useState } from "react";
import { getAttendanceSummary, type AttendanceSummary } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import { cn } from "@/lib/cn";

function rateColor(pct: number): string {
  if (pct >= 80) return "text-accent-2";
  if (pct >= 60) return "text-accent";
  return "text-danger";
}

export default function AttendanceSummaryList() {
  const [rows, setRows] = useState<AttendanceSummary[]>([]);

  const fetchAll = useCallback(async () => {
    const data = await getAttendanceSummary();
    return Array.isArray(data) ? data : [data];
  }, []);
  const applyAll = useCallback((data: AttendanceSummary[]) => setRows(data), []);
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  if (status === "loading") return <LoadingBlock lines={2} />;
  if (status === "error") {
    return <ErrorState message="Përqindjet nuk u ngarkuan." onRetry={reload} />;
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface-2/30 px-4 py-6 text-center text-xs text-text-lo">
        Ende pa prezencë të regjistruar.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
      {rows.map((r) => (
        <li
          key={r.session_id ?? r.subject_name}
          className="flex items-center justify-between gap-3 px-4 py-2.5"
        >
          <span className="truncate text-[13px] text-text-hi">
            {r.subject_name ?? "—"}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-[11px] text-text-lo">
              {r.attended}/{r.total}
            </span>
            <span
              className={cn("font-mono text-[13px] font-semibold", rateColor(r.rate_pct))}
            >
              {r.rate_pct.toFixed(0)}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
