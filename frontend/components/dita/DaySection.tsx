import type { ComponentType, ReactNode } from "react";

interface Props {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  accent?: "orange" | "violet";
  count?: number;
  isEmpty: boolean;
  emptyLabel?: string;
  footer?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export default function DaySection({
  icon: Icon,
  title,
  accent = "orange",
  count,
  isEmpty,
  emptyLabel = "asgjë atë ditë",
  footer,
  action,
  children,
}: Props) {
  return (
    <section className="rp-card flex flex-col rounded-2xl border border-border bg-surface">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span
          className={
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border " +
            (accent === "violet" ? "text-accent-2" : "text-accent")
          }
        >
          <Icon size={17} />
        </span>
        <h2 className="flex-1 font-display text-sm font-semibold text-text-hi">
          {title}
        </h2>
        {count != null && count > 0 && (
          <span className="font-mono text-[11px] text-text-lo">{count}</span>
        )}
        {action}
      </header>

      {isEmpty ? (
        <p className="px-4 py-3 text-xs text-text-lo">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">{children}</div>
      )}

      {!isEmpty && footer}
    </section>
  );
}
