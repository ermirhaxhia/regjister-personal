"use client";

import { IconBook } from "@/components/icons";
import DaySection from "@/components/dita/DaySection";
import DayScheduleList from "@/components/shkolla/DayScheduleList";

interface Props {
  date: string;
}

export default function DaySchoolSection({ date }: Props) {
  return (
    <DaySection icon={IconBook} title="Shkolla" accent="violet" isEmpty={false}>
      <DayScheduleList key={date} date={date} />
    </DaySection>
  );
}
