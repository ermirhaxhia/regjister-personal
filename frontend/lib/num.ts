const intFmt = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export function formatInt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return intFmt.format(Math.round(n));
}

export function formatSignedInt(n: number): string {
  const s = formatInt(Math.abs(n));
  if (n === 0) return "0";
  return n < 0 ? `−${s}` : `+${s}`;
}
