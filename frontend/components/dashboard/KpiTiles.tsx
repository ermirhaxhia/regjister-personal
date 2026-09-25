"use client";

import { cn } from "@/lib/cn";
import type { SavingsRateMonth } from "@/lib/api";

function SavingsRateTile({ savingsRate }: { savingsRate: SavingsRateMonth[] }) {
  const current = savingsRate[savingsRate.length - 1] ?? null;
  const previous = savingsRate[savingsRate.length - 2] ?? null;

  if (current?.rate_pct == null) {
    return (
      <Tile label="Norma e kursimit">
        <Value muted>—</Value>
        <Sub>pa të ardhura ende</Sub>
      </Tile>
    );
  }

  let sub: React.ReactNode = "këtë muaj";
  if (previous?.rate_pct != null) {
    const diff = Math.round(current.rate_pct - previous.rate_pct);
    if (diff !== 0) {
      const arrow = diff > 0 ? "▲" : "▼";
      const color = diff > 0 ? "text-success" : "text-danger";
      sub = (
        <>
          <span className={color}>
            {arrow} {Math.abs(diff)}pp
          </span>{" "}
          nga muaji i kaluar
        </>
      );
    } else {
      sub = "njësoj si muaji i kaluar";
    }
  }

  return (
    <Tile label="Norma e kursimit">
      <Value>
        {current.rate_pct.toFixed(0)}
        <Unit>%</Unit>
      </Value>
      <Sub>{sub}</Sub>
    </Tile>
  );
}

function RunwayTile({ runwayDays }: { runwayDays: number | null }) {
  if (runwayDays == null) {
    return (
      <Tile label="Runway">
        <Value muted>—</Value>
        <Sub>pa mjaftueshëm të dhëna shpenzimesh</Sub>
      </Tile>
    );
  }
  return (
    <Tile label="Runway">
      <Value>
        {runwayDays}
        <Unit> ditë</Unit>
      </Value>
      <Sub>me ritmin aktual të shpenzimeve</Sub>
    </Tile>
  );
}

function CompletenessTile({ pct }: { pct: number }) {
  return (
    <Tile label="Plotësia e regjistrimit">
      <Value>
        {pct}
        <Unit>%</Unit>
      </Value>
      <Sub>ditë me të dhëna, 30 ditët e fundit</Sub>
    </Tile>
  );
}

export default function KpiTiles({
  savingsRate,
  runwayDays,
  dataCompletenessPct,
}: {
  savingsRate: SavingsRateMonth[];
  runwayDays: number | null;
  dataCompletenessPct: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SavingsRateTile savingsRate={savingsRate} />
      <RunwayTile runwayDays={runwayDays} />
      <CompletenessTile pct={dataCompletenessPct} />
    </div>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rp-card rounded-[18px] border border-border bg-surface px-4 py-4 sm:px-[22px] sm:py-[18px]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-lo">
        {label}
      </div>
      {children}
    </div>
  );
}

function Value({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-2 font-display text-[28px] font-semibold leading-none",
        muted ? "text-text-lo" : "text-text-hi",
      )}
    >
      {children}
    </div>
  );
}

function Unit({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 font-display text-xs font-normal text-text-lo">
      {children}
    </span>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[11.5px] leading-relaxed text-text-mid">
      {children}
    </p>
  );
}
