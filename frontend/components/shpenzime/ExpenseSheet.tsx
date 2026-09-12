"use client";

import { useId, useMemo, useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import { todayISO } from "@/lib/date";
import {
  ApiError,
  createExpense,
  createExpenseCategory,
  updateExpense,
  type Expense,
} from "@/lib/api";

type SaveMode = "create" | "update";

const NEW_CATEGORY = "__new__";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (row: Expense, mode: SaveMode) => void;
  initial?: Expense | null;
  categories?: string[];
  defaultDate?: string;
}

export default function ExpenseSheet({
  open,
  onClose,
  onSaved,
  initial,
  categories = [],
  defaultDate,
}: Props) {
  const selectId = useId();
  const editing = Boolean(initial);

  const options = useMemo(
    () =>
      initial?.category && !categories.includes(initial.category)
        ? [initial.category, ...categories]
        : categories,
    [categories, initial],
  );

  const [amount, setAmount] = useState(initial ? initial.amount : "");
  const [category, setCategory] = useState(
    initial?.category ?? (options.length === 0 ? NEW_CATEGORY : ""),
  );
  const [newCategory, setNewCategory] = useState("");
  const [date, setDate] = useState(
    initial?.entry_date ?? defaultDate ?? todayISO(),
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usingNew = options.length === 0 || category === NEW_CATEGORY;
  const chosenCategory = (usingNew ? newCategory : category).trim();

  const normalized = amount.trim().replace(",", ".");
  const amountNum = Number(normalized);
  const amountValid = /^\d+(\.\d{1,2})?$/.test(normalized) && amountNum > 0;
  const valid = amountValid && chosenCategory.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      let categoryName = chosenCategory;
      if (usingNew) {
        try {
          const created = await createExpenseCategory(categoryName);
          categoryName = created.name;
        } catch (err) {
          if (!(err instanceof ApiError) || err.status !== 409) throw err;
        }
      }
      const body = {
        amount: amountNum,
        category: categoryName,
        entry_date: date,
        description: description.trim() || null,
      };
      const row =
        editing && initial
          ? await updateExpense(initial.id, body)
          : await createExpense(body);
      onSaved(row, editing ? "update" : "create");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      title={editing ? "Ndrysho shpenzimin" : "Shto shpenzim"}
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

        {options.length > 0 && (
          <Field label="Kategoria" htmlFor={selectId}>
            <select
              id={selectId}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Zgjidh kategori
              </option>
              {options.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={NEW_CATEGORY}>＋ Kategori e re</option>
            </select>
          </Field>
        )}

        {usingNew && (
          <Field
            label={options.length > 0 ? "Emri i kategorisë së re" : "Kategoria"}
          >
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={inputClass}
              placeholder="p.sh. Ushqim"
            />
          </Field>
        )}

        <Field label="Data">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Përshkrim (opsional)">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </Field>

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
