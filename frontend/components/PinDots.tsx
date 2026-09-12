import { cn } from "@/lib/cn";

type PinDotsProps = {
  filled: number;
  total: number;
  error: boolean;
};

export default function PinDots({ filled, total, error }: PinDotsProps) {
  return (
    <div
      className={cn("flex items-center gap-[18px]", error && "animate-shake")}
      role="status"
      aria-label={`${filled} nga ${total} shifra të futura`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i < filled;
        return (
          <span
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              error
                ? isFilled
                  ? "bg-[#E5484D] shadow-[0_0_14px_rgba(229,72,77,0.5)]"
                  : "border border-[#E5484D]/55"
                : isFilled
                  ? "bg-accent shadow-[0_0_14px_rgba(255,122,60,0.55)]"
                  : "border border-white/[0.28]",
            )}
          />
        );
      })}
    </div>
  );
}
