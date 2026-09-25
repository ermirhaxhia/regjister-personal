"use client";

import { useState } from "react";
import {
  ApiError,
  deleteFitnessEntry,
  type ActivityType,
  type ActivityUnit,
  type DayFitness,
  type FitnessEntry,
} from "@/lib/api";
import { formatUnitValue } from "@/lib/fitnessUnits";
import { IconPencil, IconTrash, IconActivity } from "@/components/icons";
import DaySection from "@/components/dita/DaySection";
import DayHeaderAction from "@/components/dita/DayHeaderAction";
import Confirm from "@/components/common/Confirm";
import EntryModal from "@/components/aktivitet/EntryModal";

interface Props {
  date: string;
  items: DayFitness[];
  types: ActivityType[];
  units: ActivityUnit[];
  onChanged: () => void;
}

function toEntry(item: DayFitness, date: string, typeId: string): FitnessEntry {
  return {
    id: item.id,
    entry_date: date,
    activity_type_id: typeId,
    activity_type_name: item.activity_type_name,
    values: item.values,
    note: item.note,
    created_at: "",
    updated_at: "",
  };
}

export default function DayFitnessSection({
  date,
  items,
  types,
  units,
  onChanged,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ActivityType | null>(null);
  const [editing, setEditing] = useState<DayFitness | null>(null);
  const [toDelete, setToDelete] = useState<DayFitness | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteFitnessEntry(toDelete.id);
      setToDelete(null);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Fshirja dështoi");
    }
  };

  const openAdd = () => {
    setEditing(null);
    setModalType(types[0] ?? null);
    setModalOpen(true);
  };

  const openEdit = (item: DayFitness) => {
    const type = types.find((t) => t.name === item.activity_type_name) ?? null;
    setEditing(item);
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <>
      <DaySection
        icon={IconActivity}
        title="Aktivitet"
        accent="orange"
        count={items.length}
        isEmpty={items.length === 0}
        emptyLabel="asnjë aktivitet atë ditë"
        action={
          types.length > 0 ? (
            <DayHeaderAction label="Shto aktivitet" onClick={openAdd} />
          ) : undefined
        }
      >
        {items.map((f) => {
          const pairs = Object.entries(f.values ?? {});
          return (
            <div key={f.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <span className="truncate text-[13px] text-text-hi">
                  {f.activity_type_name || "—"}
                </span>
                <div className="mt-0.5 font-mono text-[12px] text-text-mid">
                  {pairs.length > 0
                    ? pairs.map(([k, v]) => `${k} ${formatUnitValue(v)}`).join(" · ")
                    : "—"}
                </div>
                {f.note && <p className="mt-1 text-xs text-text-lo">{f.note}</p>}
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(f)}
                  aria-label="Redakto"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-text-hi"
                >
                  <IconPencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(f)}
                  aria-label="Fshi"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-lo transition-colors hover:text-danger"
                >
                  <IconTrash size={13} />
                </button>
              </span>
            </div>
          );
        })}
      </DaySection>

      {error && <p className="px-1 text-[12px] text-danger">{error}</p>}

      <EntryModal
        key={editing?.id ?? modalType?.id ?? "new"}
        open={modalOpen}
        activityType={modalType}
        units={units}
        initial={editing ? toEntry(editing, date, modalType?.id ?? "") : null}
        defaultDate={date}
        onClose={() => setModalOpen(false)}
        onSaved={onChanged}
      />

      <Confirm
        open={Boolean(toDelete)}
        title="Fshi hyrjen"
        message={
          toDelete ? `Do të fshihet hyrja e ${toDelete.activity_type_name}.` : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
