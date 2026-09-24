"use client";

import { useState } from "react";
import type { CategoryShare } from "@/lib/api";
import { formatALL } from "@/lib/money";

interface Props {
  categories: CategoryShare[];
}

const PALETTE = [
  "#FF7A3C",
  "#8b7bff",
  "#5aa2ff",
  "#34dd93",
  "#ff5b5b",
  "#ffd23c",
  "#3ce0ff",
  "#ff8fcf",
];

const MAX_SLICES = 6;

function groupCategories(categories: CategoryShare[]): CategoryShare[] {
  if (categories.length <= MAX_SLICES) return categories;
  const head = categories.slice(0, MAX_SLICES - 1);
  const rest = categories.slice(MAX_SLICES - 1);
  const amount = rest.reduce((acc, c) => acc + Number(c.amount), 0);
  const pct = rest.reduce((acc, c) => acc + c.pct, 0);
  return [
    ...head,
    { category: "Të tjera", amount: String(amount), pct },
  ];
}

export default function CategoryDonut({ categories }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (categories.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-text-lo">
        Ende pa shpenzime këtë muaj
      </p>
    );
  }

  const slices = groupCategories(categories);
  const size = 176;
  const r = 68;
  const strokeWidth = 24;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const arcs = slices.map((s, i) => {
    const frac = Math.min(Math.max(s.pct / 100, 0), 1);
    const dash = frac * circ;
    const arc = (
      <circle
        key={s.category}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={PALETTE[i % PALETTE.length]}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="cursor-pointer"
        onMouseEnter={() => setHoverIdx(i)}
        onMouseLeave={() => setHoverIdx(null)}
      />
    );
    offset += dash;
    return arc;
  });

  const hovered = hoverIdx !== null ? slices[hoverIdx] : null;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />
          {arcs}
        </svg>
        {hovered && (
          <div
            className="rp-glass-tooltip pointer-events-none absolute left-1/2 top-1/2 z-10 w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-md px-2 py-1.5 text-center text-[11px] leading-tight text-text-hi shadow-lg"
          >
            <div className="truncate">{hovered.category}</div>
            <div className="font-mono text-text-hi">
              {formatALL(Number(hovered.amount))}
            </div>
          </div>
        )}
      </div>
      <ul className="flex w-full max-w-[220px] flex-col gap-1.5">
        {slices.map((s, i) => (
          <li
            key={s.category}
            className="flex items-center justify-between gap-2 text-[11px] text-text-mid"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              <span className="truncate">{s.category}</span>
            </span>
            <span className="shrink-0 font-mono text-text-lo">
              {Math.round(s.pct)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
