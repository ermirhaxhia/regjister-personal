"use client";

import { useState } from "react";
import Sheet from "@/components/common/Sheet";
import { Field, SubmitRow, inputClass } from "@/components/common/Field";
import {
  ApiError,
  createContact,
  updateContact,
  type Contact,
  type ContactInput,
  type Workplace,
} from "@/lib/api";

type SaveMode = "create" | "update";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (row: Contact, mode: SaveMode) => void;
  initial?: Contact | null;
  workplaces: Workplace[];
  defaultSectorId: string;
  lockSector?: boolean;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ContactSheet({
  open,
  onClose,
  onSaved,
  initial,
  workplaces,
  defaultSectorId,
  lockSector = false,
}: Props) {
  const editing = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [lastName, setLastName] = useState(initial?.last_name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sectorId, setSectorId] = useState(
    initial?.sector_id ?? defaultSectorId,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameValid = name.trim().length > 0;
  const emailValid = email.trim() === "" || EMAIL_RE.test(email.trim());
  const valid = nameValid && emailValid && sectorId.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body: ContactInput = {
        name: name.trim(),
        sector_id: sectorId,
        last_name: lastName.trim() || null,
        role: role.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        description: description.trim() || null,
      };
      const row =
        editing && initial
          ? await updateContact(initial.id, body)
          : await createContact(body);
      onSaved(row, editing ? "update" : "create");
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status >= 500
            ? "Gabim serveri, provo përsëri."
            : err.status === 0
              ? "S'u lidh dot me serverin."
              : err.message,
        );
      } else {
        setError("Ruajtja dështoi.");
      }
    } finally {
      setBusy(false);
    }
  };

  const lockedName =
    workplaces.find((w) => w.id === sectorId)?.name ?? "—";

  return (
    <Sheet
      open={open}
      title={editing ? "Ndrysho profilin" : "Kontakt i ri"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Emri">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="p.sh. Arben"
          />
        </Field>

        <Field label="Mbiemri (opsional)">
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
            placeholder="p.sh. Meta"
          />
        </Field>

        <Field label="Pozicioni (opsional)">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClass}
            placeholder="p.sh. Shitës"
          />
        </Field>

        <Field label="Telefon (opsional)">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="p.sh. 069 000 0000"
          />
        </Field>

        <Field
          label="Email (opsional)"
          error={
            email.trim() !== "" && !emailValid ? "Email i pavlefshëm." : undefined
          }
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="p.sh. arben@shembull.al"
          />
        </Field>

        <Field label="Vendi i punës" htmlFor="contact-sector">
          {lockSector ? (
            <div className={`${inputClass} text-text-mid`}>{lockedName}</div>
          ) : (
            <select
              id="contact-sector"
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className={inputClass}
            >
              {workplaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Përshkrimi i punës (opsional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${inputClass} resize-y`}
            placeholder="Çfarë bën, si lidhet me punën tënde…"
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
