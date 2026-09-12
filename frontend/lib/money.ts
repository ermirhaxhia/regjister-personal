const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export function formatALL(n: number | string | null | undefined): string {
  const value = typeof n === "string" ? Number(n) : n;
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.round(value);
  return `${nf.format(rounded)} L`;
}

export function formatALLShort(n: number | string | null | undefined): string {
  const value = typeof n === "string" ? Number(n) : n;
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000) {
    const k = value / 1000;
    const s = k.toFixed(k >= 10 || Number.isInteger(k) ? 0 : 1).replace(".", ",");
    return `${s}k L`;
  }
  return `${Math.round(value)} L`;
}

export function formatSigned(n: number): string {
  const base = formatALL(Math.abs(n));
  return n < 0 ? `-${base}` : `+${base}`;
}
