"use client";

import { useCallback, useState } from "react";
import {
  ApiError,
  getOpeningBalance,
  setOpeningBalance,
  type OpeningBalance,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import { IconWallet } from "@/components/icons";
import { formatALL } from "@/lib/money";

export default function OpeningBalanceCard() {
  const [data, setData] = useState<OpeningBalance | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((d: OpeningBalance) => setData(d), []);
  const { status, reload } = useGenLoad(getOpeningBalance, apply);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value < 0) {
      setError("Shkruaj një shumë të vlefshme.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await setOpeningBalance(value);
      setData(res);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? "Është vendosur tashmë."
            : err.message
          : "Ruajtja dështoi.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-lo">
        Financa
      </span>
      <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f12] p-5">
        {status === "loading" && <LoadingBlock lines={1} />}
        {status === "error" && (
          <ErrorState message="S'u ngarkua dot bilanci fillestar." onRetry={reload} />
        )}
        {(status === "ready" || status === "refreshing") && data && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#17171c] text-text-lo">
              <IconWallet size={21} />
            </span>
            {data.locked ? (
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="font-display text-sm font-semibold text-text-hi">Bilanci fillestar</h3>
                <p className="text-lg font-semibold text-text-hi">{formatALL(data.amount)}</p>
                <p className="text-[11.5px] text-text-lo">
                  I vendosur — s&apos;ndryshohet më nga këtu.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-1 flex-col gap-1">
                <h3 className="font-display text-sm font-semibold text-text-hi">Bilanci fillestar</h3>
                <p className="text-[11.5px] text-danger/80">
                  Kujdes: mund ta vendosësh VETËM NJË HERË. Shkruaj shumën që ke sot, para
                  se të fillosh të shtosh të ardhura/shpenzime — pas ruajtjes s&apos;ndryshohet
                  më nga këtu.
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Sa lekë ke tani"
                    className="h-[34px] w-full rounded-[9px] border border-white/[0.08] bg-[#131316] px-3 text-sm text-text-hi outline-none focus:border-accent/50 sm:w-[180px]"
                  />
                  <button
                    type="submit"
                    disabled={busy || !amount}
                    className="h-9 shrink-0 self-start rounded-lg bg-accent px-4 text-[12px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50 sm:self-center"
                  >
                    {busy ? "Duke ruajtur…" : "Ruaj"}
                  </button>
                </div>
                {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
