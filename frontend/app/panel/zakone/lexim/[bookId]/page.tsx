"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ApiError,
  getBook,
  listReadingSessions,
  updateBook,
  deleteBook,
  deleteReadingSession,
  type Book,
  type ReadingSession,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { todayISO, dayMonth } from "@/lib/date";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import { IconChevronLeft, IconPlus, IconCheck, IconTrash } from "@/components/icons";
import SessionSheet from "@/components/lexim/SessionSheet";
import SessionList from "@/components/lexim/SessionList";

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = String(params.bookId);
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lastDate, setLastDate] = useState(todayISO());
  const [toDeleteSession, setToDeleteSession] = useState<ReadingSession | null>(
    null,
  );
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmDeleteBook, setConfirmDeleteBook] = useState(false);
  const [busy, setBusy] = useState(false);

  const fetchAll = useCallback(
    (): Promise<[Book, ReadingSession[]]> =>
      Promise.all([getBook(bookId), listReadingSessions(bookId)]),
    [bookId],
  );
  const applyAll = useCallback(([b, s]: [Book, ReadingSession[]]) => {
    setBook(b);
    setSessions(s);
    if (s.length > 0) setLastDate(s[0].session_date);
  }, []);
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const onSessionSaved = useCallback((row: ReadingSession) => {
    setSessions((prev) =>
      [row, ...prev].sort((a, b) => (a.session_date < b.session_date ? 1 : -1)),
    );
    setLastDate(row.session_date);
    getBook(bookId)
      .then(setBook)
      .catch(() => undefined);
  }, [bookId]);

  const confirmDeleteSession = async () => {
    if (!toDeleteSession) return;
    try {
      await deleteReadingSession(bookId, toDeleteSession.id);
      setSessions((prev) => prev.filter((s) => s.id !== toDeleteSession.id));
      setToDeleteSession(null);
      const b = await getBook(bookId);
      setBook(b);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  const markFinished = async () => {
    if (!book || busy) return;
    setBusy(true);
    try {
      const row = await updateBook(book.id, { status: "finished" });
      setBook(row);
      setConfirmFinish(false);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Përditësimi dështoi");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!book) return;
    try {
      await deleteBook(book.id);
      router.push("/panel/zakone/lexim");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-3.5 py-4 sm:px-6 sm:py-6">
      <Link
        href="/panel/zakone/lexim"
        className="flex w-fit items-center gap-1 text-xs text-text-lo transition-colors hover:text-text-hi"
      >
        <IconChevronLeft size={14} />
        Lexim
      </Link>

      {status === "loading" && <LoadingBlock lines={4} />}
      {status === "error" && (
        <ErrorState message="Libri nuk u ngarkua." onRetry={reload} />
      )}

      {status !== "loading" && status !== "error" && !book && (
        <EmptyState
          title="Ky libër nuk u gjet"
          hint="Mund të jetë fshirë. Kthehu te lista e librave."
        />
      )}

      {book && (
        <>
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="font-display text-xl font-semibold tracking-tight text-text-hi">
                  {book.title}
                </h1>
                {book.author && (
                  <p className="text-sm text-text-mid">{book.author}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="flex h-[34px] items-center gap-1.5 rounded-[10px] bg-accent px-3.5 text-[12.5px] font-semibold text-bg transition-opacity hover:opacity-90"
              >
                <IconPlus size={15} />
                Sesion i ri
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="h-2 w-full overflow-hidden rounded-full bg-[#22222a]">
                <span
                  className="block h-full rounded-full bg-accent-2"
                  style={{ width: `${book.pct_complete}%` }}
                />
              </span>
              <span className="font-mono text-[11px] text-text-mid">
                {book.pages_read} / {book.total_pages} faqe ({book.pct_complete}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
              <Stat label="Sesione" value={String(book.sessions_count)} />
              <Stat
                label="Ritmi"
                value={
                  book.pages_per_day != null
                    ? `${book.pages_per_day.toFixed(1)} f/ditë`
                    : "—"
                }
              />
              <Stat
                label="Parashikim"
                value={
                  book.estimated_finish ? dayMonth(book.estimated_finish) : "—"
                }
              />
              <Stat
                label="Statusi"
                value={book.status === "reading" ? "Duke lexuar" : "Mbaruar"}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              {book.status === "reading" && (
                <button
                  type="button"
                  onClick={() => setConfirmFinish(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] text-text-mid transition-colors hover:text-text-hi"
                >
                  <IconCheck size={14} />
                  Shëno si të mbaruar
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDeleteBook(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] text-text-lo transition-colors hover:border-danger/50 hover:text-danger"
              >
                <IconTrash size={14} />
                Fshi librin
              </button>
            </div>
          </section>

          {sessions.length === 0 ? (
            <EmptyState
              title="Ende pa sesione"
              hint="Shto sesionin e parë me butonin «Sesion i ri»."
            />
          ) : (
            <SessionList items={sessions} onDelete={setToDeleteSession} />
          )}
        </>
      )}

      <SessionSheet
        key={sheetOpen ? "open" : "closed"}
        open={sheetOpen}
        bookId={bookId}
        defaultDate={lastDate}
        onClose={() => setSheetOpen(false)}
        onSaved={onSessionSaved}
      />

      <Confirm
        open={toDeleteSession !== null}
        title="Fshi sesionin"
        message="Do të fshihet përfundimisht ky sesion leximi."
        onConfirm={confirmDeleteSession}
        onCancel={() => setToDeleteSession(null)}
      />

      <Confirm
        open={confirmFinish}
        title="Shëno si të mbaruar"
        message="Libri kalon te «Të mbaruara». Mund ta kthesh mbrapsht më vonë duke shtuar sesion të ri."
        confirmLabel="Shëno"
        onConfirm={markFinished}
        onCancel={() => setConfirmFinish(false)}
      />

      <Confirm
        open={confirmDeleteBook}
        title="Fshi librin"
        message={
          book
            ? `Do të fshihet «${book.title}» bashkë me të gjitha sesionet e tij.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteBook(false)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] uppercase tracking-wide text-text-lo">
        {label}
      </span>
      <span className="font-mono text-sm text-text-hi">{value}</span>
    </div>
  );
}
