import { AppMark } from "@/components/icons";
import PinDots from "@/components/PinDots";
import PinKeypad from "@/components/PinKeypad";

export type PinStatus = "idle" | "checking" | "error" | "neterror";

type PinCardProps = {
  filled: number;
  total: number;
  status: PinStatus;
  errorKey: number;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
};

const MESSAGES: Record<"error" | "neterror", string> = {
  error: "PIN i pasaktë",
  neterror: "S'u lidh dot me serverin",
};

export default function PinCard({
  filled,
  total,
  status,
  errorKey,
  onDigit,
  onBackspace,
}: PinCardProps) {
  const isError = status === "error" || status === "neterror";

  return (
    <div className="flex w-[340px] flex-col items-center lg:w-[376px] lg:rounded-[20px] lg:border lg:border-white/[0.12] lg:bg-[#191a1f] lg:bg-gradient-to-b lg:from-white/[0.035] lg:to-transparent lg:px-10 lg:py-11 lg:shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
      <div className="flex flex-col items-center lg:hidden">
        <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-white/10 bg-[#1b1c21]">
          <AppMark size={20} />
        </span>
        <span className="mt-[18px] font-display text-[11px] font-medium uppercase tracking-[0.22em] text-text-lo">
          Regjistri Personal
        </span>
        <span className="mt-[30px] h-px w-7 bg-white/12" />
      </div>

      <span className="hidden font-mono text-[10.5px] font-medium uppercase tracking-[0.24em] text-text-lo lg:block">
        Hyrje
      </span>

      <h2 className="mt-7 flex min-h-[28px] items-center font-display text-[22px] font-medium leading-[1.2] tracking-[-0.005em] text-[#FAFAFA] lg:mt-4 lg:min-h-[30px] lg:text-[23px]">
        Fut PIN-in
      </h2>

      <div className="mt-8 lg:mt-7">
        <PinDots key={errorKey} filled={filled} total={total} error={isError} />
      </div>

      <div className="mt-4 flex h-5 items-center justify-center overflow-hidden">
        {isError && (
          <span className="font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.14em] text-[#D66]">
            {MESSAGES[status]}
          </span>
        )}
      </div>

      <div className="mt-7 w-full">
        <PinKeypad
          onDigit={onDigit}
          onBackspace={onBackspace}
          disabled={status === "checking"}
        />
      </div>
    </div>
  );
}
