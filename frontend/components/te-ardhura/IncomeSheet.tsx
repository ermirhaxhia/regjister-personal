"use client";

import { useId, useMemo, useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import { todayISO } from "@/lib/date";
import {
  ApiError,
  createIncome,
  createIncomeSource,
  updateIncome,
  type Income,
  type IncomeKind,
} from "@/lib/api";

type SaveMode = "create" | "update";

const NEW_SOURCE = "__new__";
const NO_SOURCE = "__none__";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (row: Income, mode: SaveMode) => void;
  initial?: Income | null;
  sources?: string[];
}

export default function IncomeSheet({
  open,
  onClose,
  onSaved,
  initial,
  sources = [],
}: Props) {
  const selectId = useId();
  const editing = Boolean(initial);

  const options = useMemo(
    () =>
      initial?.source && !sources.includes(initial.source)
        ? [initial.source, ...sources]
        : sources,
    [sources, initial],
  );

  const [amount, setAmount] = useState(initial ? initial.amount : "");
  const [kind, setKind] = useState<IncomeKind>(initial?.kind ?? "paga");
  const [month, setMonth] = useState(
    initial ? initial.period_month.slice(0, 7) : todayISO().slice(0, 7),
  );
  const [receivedOn, setReceivedOn] = useState(
    initial?.received_on ?? todayISO(),
  );
  const [source, setSource] = useState(
    initial?.source ?? (options.length === 0 ? NEW_SOURCE : NO_SOURCE),
  );
  const [newSource, setNewSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usingNew = options.length === 0 || source === NEW_SOURCE;

  const normalized = amount.trim().replace(",", ".");
  const amountNum = Number(normalized);
  const amountValid = /^\d+(\.\d{1,2})?$/.test(normalized) && amountNum > 0;
  const valid = amountValid && month.length === 7;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      let sourceName: string | null = null;
      if (usingNew) {
        const trimmed = newSource.trim();
        if (trimmed) {
          try {
            const created = await createIncomeSource(trimmed);
            sourceName = created.name;
          } catch (err) {
            if (!(err instanceof ApiError) || err.status !== 409) throw err;
            sourceName = trimmed;
          }
        }
      } else if (source !== NO_SOURCE) {
        sourceName = source;
      }
      const body = {
        amount: amountNum,
        kind,
        period_month: `${month}-01`,
        received_on: receivedOn,
        source: sourceName,
        note: initial?.note ?? null,
      };
      const row =
        editing && initial
          ? await updateIncome(initial.id, body)
          : await createIncome(body);
      onSaved(row, editing ? "update" : "create");
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status >= 500
            ? "Gabim serveri, provo përsëri"
            : err.status === 0
              ? "S'u lidh dot me serverin"
              : err.message,
        );
      } else {
        setError("Ruajtja dështoi");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      title={editing ? "Ndrysho të ardhurën" : "Shto të ardhur"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Shuma (Lekë)">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </Field>

        <Field label="Lloji" htmlFor="income-kind">
          <select
            id="income-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as IncomeKind)}
            className={inputClass}
          >
            <option value="paga">Paga</option>
            <option value="tjeter">Të ardhura të tjera</option>
          </select>
        </Field>

        <Field
          label="Muaji që mbulon"
          hint={
            kind === "paga"
              ? "Ndahet automatikisht 50/50 personale/familje."
              : "Shkon 100% te personale."
          }
        >
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Data e marrjes">
          <input
            type="date"
            value={receivedOn}
            onChange={(e) => setReceivedOn(e.target.value)}
            className={inputClass}
          />
        </Field>

        {options.length > 0 && (
          <Field label="Burimi (opsional)" htmlFor={selectId}>
            <select
              id={selectId}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={inputClass}
            >
              <option value={NO_SOURCE}>— Pa burim —</option>
              {options.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value={NEW_SOURCE}>＋ Burim i ri</option>
            </select>
          </Field>
        )}

        {usingNew && (
          <Field
            label={options.length > 0 ? "Emri i burimit të ri" : "Burimi (opsional)"}
          >
            <input
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              className={inputClass}
              placeholder="p.sh. Paga"
            />
          </Field>
        )}

        <SubmitRow
          busy={busy}
          error={error}
          onCancel={onClose}
          submitLabel={editing ? "Ruaj" : "Shto"}
        />
      </form>
    </Sheet>
  );
}
