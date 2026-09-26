"use client";

import { cn } from "@/lib/cn";
import { IconCheck, IconClose } from "@/components/icons";

interface Props {
  attended: boolean | null;
  busy: boolean;
  onPick: (attended: boolean) => void;
}

export default function AttendanceToggle({ attended, busy, onPick }: Props) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => onPick(true)}
        disabled={busy}
        aria-pressed={attended === true}
        aria-label="Shkova"
        className={cn(
          "flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11.5px] font-medium transition-colors disabled:opacity-50",
          attended === true
            ? "border-accent-2 bg-accent-2 text-bg"
            : "border-border text-text-lo hover:border-accent-2/50 hover:text-text-hi",
        )}
      >
        <IconCheck size={13} />
        Shkova
      </button>
      <button
        type="button"
        onClick={() => onPick(false)}
        disabled={busy}
        aria-pressed={attended === false}
        aria-label="S'shkova"
        className={cn(
          "flex h-8 items-center gap-1 rounded-lg border px-2.5 text-[11.5px] font-medium transition-colors disabled:opacity-50",
          attended === false
            ? "border-danger bg-danger text-bg"
            : "border-border text-text-lo hover:border-danger/50 hover:text-text-hi",
        )}
      >
        <IconClose size={12} />
        S&apos;shkova
      </button>
    </div>
  );
}
