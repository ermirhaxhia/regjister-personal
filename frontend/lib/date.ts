const WEEKDAYS = [
  "e diel",
  "e hënë",
  "e martë",
  "e mërkurë",
  "e enjte",
  "e premte",
  "e shtunë",
];

const MONTHS = [
  "janar",
  "shkurt",
  "mars",
  "prill",
  "maj",
  "qershor",
  "korrik",
  "gusht",
  "shtator",
  "tetor",
  "nëntor",
  "dhjetor",
];

const MONTHS_SHORT = [
  "jan",
  "shk",
  "mar",
  "pri",
  "maj",
  "qer",
  "kor",
  "gsh",
  "sht",
  "tet",
  "nën",
  "dhj",
];

function asDate(input: string | Date): Date {
  return typeof input === "string" ? new Date(input) : input;
}

export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

export function fullDate(input: string | Date): string {
  const d = asDate(input);
  return `${WEEKDAYS[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dayMonth(input: string | Date): string {
  const d = asDate(input);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

export function dayMonthShort(input: string | Date): string {
  const d = asDate(input);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function monthShort(input: string | Date): string {
  return MONTHS_SHORT[asDate(input).getMonth()];
}

export function monthLabel(input: string | Date): string {
  const d = asDate(input);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function timeLabel(input: string | Date): string {
  const d = asDate(input);
  return d.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });
}

export function durationLabel(minutes: number | string | null | undefined): string {
  const m = typeof minutes === "string" ? Number(minutes) : minutes;
  if (m == null || Number.isNaN(m)) return "—";
  const total = Math.round(m);
  const h = Math.floor(total / 60);
  const min = total % 60;
  if (h === 0) return `${min}m`;
  return `${h}h ${min}m`;
}

export function daysSince(input: string | Date): number {
  const d = asDate(input);
  const now = new Date();
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((b - a) / 86400000);
}

export function toDatetimeLocal(input: string | Date): string {
  const d = asDate(input);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}
