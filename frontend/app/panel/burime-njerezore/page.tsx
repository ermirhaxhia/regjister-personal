"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { listWorkplaces, listContacts, type Workplace, type Contact } from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import PageHeader from "@/components/common/PageHeader";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/common/States";
import WorkplaceCard from "@/components/hr/WorkplaceCard";
import ColdContactsSection from "@/components/burime-njerezore/ColdContactsSection";

export default function WorkplacesPage() {
  const [items, setItems] = useState<Workplace[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const fetchAll = useCallback(
    () => Promise.all([listWorkplaces(), listContacts()]),
    [],
  );
  const apply = useCallback(([wps, cs]: [Workplace[], Contact[]]) => {
    setItems(wps);
    setContacts(cs);
  }, []);
  const { status, reload } = useGenLoad(fetchAll, apply);

  const ready = status === "ready" || status === "refreshing";
  const totalContacts = items.reduce((s, w) => s + w.contact_count, 0);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <PageHeader
        title="Burime Njerëzore"
        meta={
          ready && items.length > 0
            ? `${items.length} vende · ${totalContacts} kontakte`
            : undefined
        }
      />

      {status === "loading" && <LoadingBlock lines={4} />}
      {status === "error" && (
        <ErrorState message="Vendet e punës nuk u ngarkuan." onRetry={reload} />
      )}

      {ready && items.length === 0 && (
        <EmptyState
          title="Ende pa vende pune"
          hint="Kontaktet grupohen sipas vendit të punës. Shtoji te Cilësimet për të nisur."
          action={
            <Link
              href="/panel/cilesime"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              Shto vendet e punës te Cilësimet
            </Link>
          }
        />
      )}

      {ready && items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => (
            <WorkplaceCard key={w.id} item={w} />
          ))}
        </div>
      )}

      {ready && items.length > 0 && (
        <ColdContactsSection contacts={contacts} workplaces={items} />
      )}
    </div>
  );
}
