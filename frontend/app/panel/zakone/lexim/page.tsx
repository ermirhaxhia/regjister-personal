"use client";

import { useCallback, useMemo, useState } from "react";
import { listBooks, type Book } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { useRegisterAdd } from "@/components/shell/ShellContext";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import BookCard from "@/components/lexim/BookCard";
import BookForm from "@/components/lexim/BookForm";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-lo">
      {children}
    </h2>
  );
}

export default function ReadingPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchList = useCallback(() => listBooks(), []);
  const applyList = useCallback((data: Book[]) => setBooks(data), []);
  const { status, reload } = useGenLoad(fetchList, applyList);

  const reading = useMemo(
    () => books.filter((b) => b.status === "reading"),
    [books],
  );
  const finished = useMemo(
    () => books.filter((b) => b.status === "finished"),
    [books],
  );

  const onSaved = useCallback((row: Book) => {
    setBooks((prev) => [row, ...prev]);
  }, []);

  const openAdd = useCallback(() => setSheetOpen(true), []);
  useRegisterAdd("Libër i ri", openAdd);

  const ready = status === "ready" || status === "refreshing";

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader title="Lexim" actionLabel="Libër i ri" onAction={openAdd} />

      {status === "loading" && <LoadingBlock lines={4} />}
      {status === "error" && (
        <ErrorState message="Librat nuk u ngarkuan." onRetry={reload} />
      )}

      {ready && books.length === 0 && (
        <EmptyState
          title="Ende pa libra"
          hint="Shto librin e parë për të nisur ndjekjen e leximit."
          action={
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-mid transition-colors hover:text-text-hi"
            >
              Shto librin e parë
            </button>
          }
        />
      )}

      {ready && reading.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionTitle>Duke lexuar</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reading.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}

      {ready && finished.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionTitle>Të mbaruara</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {finished.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}

      <BookForm
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
