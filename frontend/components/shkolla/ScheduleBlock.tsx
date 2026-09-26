import type { ClassSession } from "@/lib/api";
import { colorForSubject, timeToMinutes } from "./scheduleColors";
import { timeShort } from "@/lib/weekday";

interface Props {
  session: ClassSession;
  rangeStartMinutes: number;
  totalMinutes: number;
}

export default function ScheduleBlock({
  session,
  rangeStartMinutes,
  totalMinutes,
}: Props) {
  const start = timeToMinutes(session.start_time);
  const end = timeToMinutes(session.end_time);
  const topPct = ((start - rangeStartMinutes) / totalMinutes) * 100;
  const heightPct = ((end - start) / totalMinutes) * 100;
  const durationMin = end - start;
  const color = colorForSubject(session.subject_name);
  const compact = durationMin < 45;

  return (
    <div
      className="absolute inset-x-0.5 overflow-hidden rounded-md px-1.5 py-1 text-white shadow-sm"
      style={{
        top: `${topPct}%`,
        height: `${heightPct}%`,
        backgroundColor: color,
      }}
      title={`${session.subject_name} · ${timeShort(session.start_time)}–${timeShort(session.end_time)}${session.room ? " · " + session.room : ""}`}
    >
      <p className="truncate text-[11px] font-semibold leading-tight">
        {session.subject_name}
      </p>
      {!compact && (
        <p className="truncate text-[9.5px] leading-tight text-white/85">
          {session.session_type ?? "Seancë"} · {timeShort(session.start_time)}
          –{timeShort(session.end_time)}
        </p>
      )}
      {!compact && (session.room || session.professor) && (
        <p className="truncate text-[9px] leading-tight text-white/70">
          {[session.room, session.professor].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}
