"use client";

import { useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import { ApiError, createBook, type Book } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (row: Book) => void;
}

export default function BookForm({ open, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagesNum = Number(totalPages);
  const valid =
    title.trim().length > 0 &&
    Number.isFinite(pagesNum) &&
    pagesNum > 0 &&
    Number.isInteger(pagesNum);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const row = await createBook({
        title: title.trim(),
        author: author.trim() || null,
        total_pages: pagesNum,
      });
      onSaved(row);
      setTitle("");
      setAuthor("");
      setTotalPages("");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} title="Libër i ri" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Titulli">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="p.sh. Kështjella"
          />
        </Field>

        <Field label="Autori (opsional)">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={inputClass}
            placeholder="—"
          />
        </Field>

        <Field label="Faqe gjithsej">
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </Field>

        <SubmitRow
          busy={busy}
          error={error}
          onCancel={onClose}
          submitLabel="Shto"
          disabled={!valid}
        />
      </form>
    </Sheet>
  );
}
