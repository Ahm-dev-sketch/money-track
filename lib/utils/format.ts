export function formatIDR(n: number): string {
  const v = Number.isFinite(n) ? Math.round(n) : 0;
  return "Rp " + v.toLocaleString("id-ID");
}

export function formatNumber(n: number): string {
  return (Number.isFinite(n) ? Math.round(n) : 0).toLocaleString("id-ID");
}

/** "150000" -> "Rp 150.000" untuk tampilan input live. */
export function formatAmountInput(raw: string): string {
  const n = inputToAmountInt(raw);
  if (!n && raw.replace(/\D/g, "").length === 0) return "";
  return "Rp " + n.toLocaleString("id-ID");
}

export function inputToAmountInt(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Kompak untuk axis chart: "Rp 1,5 jt" */
export function formatCompactIDR(n: number): string {
  const v = Math.round(n);
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return sign + "Rp " + (abs / 1_000_000_000).toFixed(1).replace(".", ",") + " M";
  if (abs >= 1_000_000) return sign + "Rp " + (abs / 1_000_000).toFixed(1).replace(".", ",") + " jt";
  if (abs >= 1_000) return sign + "Rp " + (abs / 1_000).toFixed(1).replace(".", ",") + " rb";
  return sign + "Rp " + abs;
}
