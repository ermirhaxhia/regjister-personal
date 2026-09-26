export const WEEKDAY_LABELS = [
  "E Hënë",
  "E Martë",
  "E Mërkurë",
  "E Enjte",
  "E Premte",
  "E Shtunë",
  "E Diel",
];

export const WEEKDAY_SHORT = ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Die"];

export function weekdayFromISO(iso: string): number {
  const jsDay = new Date(`${iso}T00:00:00`).getDay();
  return (jsDay + 6) % 7;
}

export function timeShort(hms: string): string {
  return hms.slice(0, 5);
}

export function groupByWeekday<T>(
  items: T[],
  getWeekday: (item: T) => number,
  getStartTime: (item: T) => string,
): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const item of items) {
    const wd = getWeekday(item);
    const list = map.get(wd) ?? [];
    list.push(item);
    map.set(wd, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => getStartTime(a).localeCompare(getStartTime(b)));
  }
  return map;
}
