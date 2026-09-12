"use client";

import {
  IconPhone,
  IconMail,
  IconUsers,
  IconPencil,
  IconTrash,
  IconChevronRight,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import type { Contact } from "@/lib/api";

interface Props {
  contact: Contact;
  workplaceName: string;
  descriptionOpen: boolean;
  onToggleDescription: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddDescription: () => void;
}

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-text-mid">
      <span className="text-text-lo">{icon}</span>
      {children}
    </div>
  );
}

export default function ContactProfile({
  contact,
  workplaceName,
  descriptionOpen,
  onToggleDescription,
  onEdit,
  onDelete,
  onAddDescription,
}: Props) {
  const displayName = [contact.name, contact.last_name]
    .filter(Boolean)
    .join(" ");
  const hasDescription = Boolean(contact.description?.trim());

  return (
    <section className="flex w-full flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text-hi">
          {displayName}
        </h1>
        <p className="text-sm text-text-mid">{contact.role || "—"}</p>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <Row icon={<IconPhone size={15} />}>
          {contact.phone ? (
            <a
              href={`tel:${contact.phone.replace(/\s+/g, "")}`}
              className="text-text-hi transition-colors hover:text-accent"
            >
              {contact.phone}
            </a>
          ) : (
            <span className="text-text-lo">—</span>
          )}
        </Row>
        <Row icon={<IconMail size={15} />}>
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="break-all text-text-hi transition-colors hover:text-accent"
            >
              {contact.email}
            </a>
          ) : (
            <span className="text-text-lo">—</span>
          )}
        </Row>
        <Row icon={<IconUsers size={15} />}>
          <span>{workplaceName}</span>
        </Row>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onToggleDescription}
          className="flex items-center justify-between gap-2 text-left text-[13px] font-medium text-text-mid transition-colors hover:text-text-hi"
        >
          <span>{descriptionOpen ? "Mbyll përshkrimin" : "Lexo më shumë"}</span>
          <IconChevronRight
            size={15}
            className={cn(
              "shrink-0 transition-transform",
              descriptionOpen && "rotate-90",
            )}
          />
        </button>

        {descriptionOpen &&
          (hasDescription ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-mid">
              {contact.description}
            </p>
          ) : (
            <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border bg-surface-2/40 px-4 py-4">
              <p className="text-xs text-text-lo">Pa përshkrim ende.</p>
              <button
                type="button"
                onClick={onAddDescription}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-mid transition-colors hover:border-accent/50 hover:text-text-hi"
              >
                Shto përshkrim
              </button>
            </div>
          ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] text-text-mid transition-colors hover:text-text-hi"
        >
          <IconPencil size={14} />
          Ndrysho profilin
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] text-text-lo transition-colors hover:border-danger/50 hover:text-danger"
        >
          <IconTrash size={14} />
          Fshi kontaktin
        </button>
      </div>
    </section>
  );
}
