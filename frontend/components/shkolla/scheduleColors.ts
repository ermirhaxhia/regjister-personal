export const SUBJECT_PALETTE = [
  "#FF7A3C",
  "#8b7bff",
  "#5aa2ff",
  "#34dd93",
  "#ff5b5b",
  "#ffd23c",
  "#3ce0ff",
  "#ff8fcf",
];

export function colorForSubject(subjectName: string): string {
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = (hash * 31 + subjectName.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % SUBJECT_PALETTE.length;
  return SUBJECT_PALETTE[idx];
}

export function timeToMinutes(hms: string): number {
  const [h, m] = hms.split(":").map(Number);
  return h * 60 + (m ?? 0);
}
