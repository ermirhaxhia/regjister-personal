export const UNIT_ORDER = [
  "hapa",
  "km",
  "kohe",
  "metra",
  "perseritje",
  "sete",
  "pesha",
  "kalori",
] as const;

export const UNIT_SHORT: Record<string, string> = {
  hapa: "hapa",
  km: "km",
  kohe: "min",
  metra: "m",
  perseritje: "përsëritje",
  sete: "sete",
  pesha: "kg",
  kalori: "kcal",
};

const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });

export function formatUnitValue(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? Number(n) : n;
  if (v == null || Number.isNaN(v)) return "—";
  return nf.format(v);
}

export function shortUnit(key: string): string {
  return UNIT_SHORT[key] ?? key;
}

export function describeValues(values: Record<string, number>): string {
  const order = UNIT_ORDER as readonly string[];
  const entries = Object.entries(values ?? {})
    .filter(([, v]) => v != null && !Number.isNaN(Number(v)))
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  if (entries.length === 0) return "—";
  return entries
    .map(([k, v]) => `${formatUnitValue(v)} ${shortUnit(k)}`)
    .join(" · ");
}
