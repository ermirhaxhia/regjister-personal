import { cn } from "@/lib/cn";
import { IconBackspace } from "@/components/icons";

type PinKeypadProps = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  disabled: boolean;
};

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const keyBase =
  "flex h-[58px] w-full items-center justify-center rounded-[13px] font-mono text-[20px] text-[#FAFAFA] transition-colors select-none disabled:opacity-40";

const digitKey =
  "border border-white/[0.14] bg-[#17171C] hover:border-white/25 hover:bg-white/[0.04] active:bg-white/[0.06]";

export default function PinKeypad({
  onDigit,
  onBackspace,
  disabled,
}: PinKeypadProps) {
  return (
    <div className="mx-auto grid w-full max-w-[264px] grid-cols-3 gap-3.5 lg:max-w-[288px] lg:gap-3">
      {DIGITS.map((d) => (
        <button
          key={d}
          type="button"
          disabled={disabled}
          onClick={() => onDigit(d)}
          className={cn(keyBase, digitKey)}
        >
          {d}
        </button>
      ))}

      <span aria-hidden="true" />

      <button
        type="button"
        disabled={disabled}
        onClick={() => onDigit("0")}
        className={cn(keyBase, digitKey)}
      >
        0
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onBackspace}
        aria-label="Fshi shifrën e fundit"
        className={cn(keyBase, "text-text-mid hover:text-text-hi")}
      >
        <IconBackspace size={22} />
      </button>
    </div>
  );
}
