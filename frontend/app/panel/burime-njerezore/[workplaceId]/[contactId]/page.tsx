"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getContact,
  listWorkplaces,
  deleteContact,
  ApiError,
  type Contact,
  type Workplace,
} from "@/lib/api";
import { useGenLoad } from "@/lib/useGenLoad";
import { notifyDataChanged } from "@/components/shell/ShellContext";
import { LoadingBlock, ErrorState } from "@/components/common/States";
import Confirm from "@/components/common/Confirm";
import Breadcrumb from "@/components/hr/Breadcrumb";
import ContactProfile from "@/components/hr/ContactProfile";
import ContactNotes from "@/components/hr/ContactNotes";
import ContactSheet from "@/components/hr/ContactSheet";

export default function ContactDetailPage() {
  const params = useParams<{ workplaceId: string; contactId: string }>();
  const workplaceId = String(params.workplaceId);
  const contactId = String(params.contactId);
  const router = useRouter();

  const [contact, setContact] = useState<Contact | null>(null);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [descOpen, setDescOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchAll = useCallback(
    () => Promise.all([getContact(contactId), listWorkplaces()]),
    [contactId],
  );
  const applyAll = useCallback(([c, wps]: [Contact, Workplace[]]) => {
    setContact(c);
    setWorkplaces(wps);
  }, []);
  const { status, reload } = useGenLoad(fetchAll, applyAll);

  const workplaceName = useMemo(() => {
    if (!contact) return "…";
    return workplaces.find((w) => w.id === contact.sector_id)?.name ?? "Vendi";
  }, [contact, workplaces]);

  const backHref = `/panel/burime-njerezore/${contact?.sector_id ?? workplaceId}`;

  const remove = async () => {
    if (!contact) return;
    try {
      await deleteContact(contact.id);
      notifyDataChanged({ key: "hr", diff: -1 });
      router.push(backHref);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Fshirja dështoi.");
      setConfirmOpen(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-3.5 py-4 sm:px-6 sm:py-6">
      <Breadcrumb
        items={[
          { label: "Vendet", href: "/panel/burime-njerezore" },
          { label: workplaceName, href: backHref },
          {
            label: contact
              ? [contact.name, contact.last_name].filter(Boolean).join(" ")
              : "…",
          },
        ]}
      />

      {status === "loading" && <LoadingBlock lines={4} />}
      {status === "error" && (
        <ErrorState
          message="Kontakti nuk u gjet ose nuk u ngarkua."
          onRetry={reload}
        />
      )}

      {(status === "ready" || status === "refreshing") && contact && (
        <>
          <ContactProfile
            contact={contact}
            workplaceName={workplaceName}
            descriptionOpen={descOpen}
            onToggleDescription={() => setDescOpen((v) => !v)}
            onEdit={() => setSheetOpen(true)}
            onDelete={() => setConfirmOpen(true)}
            onAddDescription={() => setSheetOpen(true)}
          />

          {descOpen && <ContactNotes contactId={contact.id} />}

          <div>
            <Link
              href={backHref}
              className="text-xs text-text-lo transition-colors hover:text-text-mid"
            >
              ← Të gjithë kontaktet e «{workplaceName}»
            </Link>
          </div>

          <ContactSheet
            key={contact.updated_at}
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onSaved={(row) => setContact(row)}
            initial={contact}
            workplaces={workplaces}
            defaultSectorId={contact.sector_id}
          />

          <Confirm
            open={confirmOpen}
            title="Fshi kontaktin"
            message={`Do të fshihet «${[contact.name, contact.last_name]
              .filter(Boolean)
              .join(" ")}» bashkë me të gjitha shënimet e tij.`}
            onConfirm={remove}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      )}
    </div>
  );
}
