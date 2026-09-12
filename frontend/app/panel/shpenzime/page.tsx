"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listExpenses,
  deleteExpense,
  listExpenseCategories,
  ApiError,
  type Expense,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { useRegisterAdd, notifyDataChanged } from "@/components/shell/ShellContext";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import ExpenseList from "@/components/shpenzime/ExpenseList";
import ExpenseSheet from "@/components/shpenzime/ExpenseSheet";
import MonthFilter, { monthRange } from "@/components/shpenzime/MonthFilter";

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [catNames, setCatNames] = useState<string[]>([]);
  const [month, setMonth] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [toDelete, setToDelete] = useState<Expense | null>(null);

  const fetchList = useCallback(
    () => listExpenses(monthRange(month)),
    [month],
  );
  const applyList = useCallback((data: Expense[]) => setItems(data), []);
  const { status, reload } = useGenLoad(fetchList, applyList);

  const loadCats = useCallback(() => {
    listExpenseCategories()
      .then((cs) => setCatNames(cs.map((c) => c.name)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    loadCats();
  }, [loadCats]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setSheetOpen(true);
  }, []);
  useRegisterAdd("Shto shpenzim", openAdd);

  const changeMonth = useCallback((m: string) => {
    setMonth(m);
  }, []);

  const onSaved = useCallback(
    (row: Expense, mode: "create" | "update") => {
      sessionStorage.setItem("rp_summary_stale", "1");
      loadCats();
      if (mode === "update") {
        setItems((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        return;
      }
      notifyDataChanged({ key: "expenses", diff: 1 });
      if (month && !row.entry_date.startsWith(month)) return;
      setItems((prev) => [row, ...prev]);
    },
    [month, loadCats],
  );

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteExpense(toDelete.id);
      setItems((prev) => prev.filter((r) => r.id !== toDelete.id));
      notifyDataChanged({ key: "expenses", diff: -1 });
      sessionStorage.setItem("rp_summary_stale", "1");
      setToDelete(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Shpenzime" actionLabel="Shto" onAction={openAdd} />

      <div className="flex items-center justify-between">
        <MonthFilter value={month} onChange={changeMonth} />
        <span className="font-mono text-xs text-text-lo">
          {status === "ready" || status === "refreshing"
            ? `${items.length} hyrje`
            : ""}
        </span>
      </div>

      {status === "loading" && <LoadingBlock lines={5} />}
      {status === "error" && (
        <ErrorState message="Lista nuk u ngarkua." onRetry={reload} />
      )}
      {(status === "ready" || status === "refreshing") &&
        items.length === 0 && (
          <EmptyState
            title={month ? "Asnjë shpenzim për këtë muaj" : "Ende pa shpenzime"}
            hint={
              month
                ? "Provo një muaj tjetër ose hiq filtrin."
                : "Shto shpenzimin e parë me butonin lart."
            }
          />
        )}
      {(status === "ready" || status === "refreshing") && items.length > 0 && (
        <div
          className={
            status === "refreshing"
              ? "opacity-60 transition-opacity"
              : "transition-opacity"
          }
          aria-busy={status === "refreshing"}
        >
          <ExpenseList
            items={items}
            onEdit={(e) => {
              setEditing(e);
              setSheetOpen(true);
            }}
            onDelete={setToDelete}
          />
        </div>
      )}

      <ExpenseSheet
        key={sheetOpen ? (editing ? `edit-${editing.id}` : "new") : "closed"}
        open={sheetOpen}
        initial={editing}
        categories={catNames}
        onClose={() => setSheetOpen(false)}
        onSaved={onSaved}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi shpenzimin"
        message={
          toDelete
            ? `Do të fshihet përfundimisht hyrja «${toDelete.category}».`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
