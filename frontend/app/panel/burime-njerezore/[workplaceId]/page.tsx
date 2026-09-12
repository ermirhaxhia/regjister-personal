"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  listWorkplaces,
  listContacts,
  type Workplace,
  type Contact,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { notifyDataChanged } from "@/components/shell/ShellContext";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import { IconPlus, IconSearch } from "@/components/icons";
import { inputClass } from "@/components/common/Field";
import Breadcrumb from "@/components/hr/Breadcrumb";
import ContactsTable from "@/components/hr/ContactsTable";
import ContactSheet from "@/components/hr/ContactSheet";

export default function WorkplaceContactsPage() {
  const params = useParams<{ workplaceId: string }>();
  const workplaceId = String(params.workplaceId);

  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchAll = useCallback(
    () => Promise.all([listWorkplaces(), listContacts(workplaceId)]),
    [workplaceId],
  );
  const applyAll = useCallback(
    ([wps, cs]: [Workplace[], Contact[]]) => {
      setWorkplaces(wps);
      setContacts(cs);
    },
    [],
  );
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const workplace = useMemo(
    () => workplaces.find((w) => w.id === workplaceId) ?? null,
    [workplaces, workplaceId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.last_name].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [contacts, query]);

  const ready = status === "ready" || status === "refreshing";
  const base = `/panel/burime-njerezore/${workplaceId}`;

  const onSaved = useCallback((row: Contact) => {
    setContacts((prev) =>
      [...prev, row].sort((a, b) =>
        `${a.name} ${a.last_name ?? ""}`.localeCompare(
          `${b.name} ${b.last_name ?? ""}`,
        ),
      ),
    );
    notifyDataChanged({ key: "hr", diff: 1 });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <Breadcrumb
        items={[
          { label: "Vendet", href: "/panel/burime-njerezore" },
          { label: workplace?.name ?? "…" },
        ]}
      />

      {ready && !workplace ? (
        <EmptyState
          title="Ky vend pune nuk u gjet"
          hint="Mund të jetë fshirë. Kthehu te lista e vendeve."
          action={
            <Link
              href="/panel/burime-njerezore"
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-mid transition-colors hover:text-text-hi"
            >
              Te vendet
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-xl font-semibold tracking-tight text-text-hi">
              {workplace?.name ?? "Kontakte"}
            </h1>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              disabled={!workplace}
              className="flex h-[34px] items-center gap-1.5 rounded-[10px] bg-accent px-3.5 text-[12.5px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <IconPlus size={15} />
              Kontakt
            </button>
          </div>

          {contacts.length > 0 && (
            <div className="relative max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-lo">
                <IconSearch size={15} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="Kërko sipas emrit…"
              />
            </div>
          )}

          {status === "loading" && <LoadingBlock lines={4} />}
          {status === "error" && (
            <ErrorState message="Kontaktet nuk u ngarkuan." onRetry={reload} />
          )}

          {ready && workplace && contacts.length === 0 && (
            <EmptyState
              title="Asnjë kontakt në këtë vend"
              hint="Shto kontaktin e parë me butonin «Kontakt» lart."
            />
          )}

          {ready && contacts.length > 0 && filtered.length === 0 && (
            <EmptyState
              title="Asnjë përputhje"
              hint="Provo një emër tjetër ose pastro kërkimin."
            />
          )}

          {ready && filtered.length > 0 && (
            <ContactsTable base={base} items={filtered} />
          )}
        </>
      )}

      {workplace && (
        <ContactSheet
          key={sheetOpen ? "sheet-open" : "sheet-closed"}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSaved={onSaved}
          workplaces={workplaces}
          defaultSectorId={workplaceId}
          lockSector
        />
      )}
    </div>
  );
}
