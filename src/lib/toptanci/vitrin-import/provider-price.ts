function toNum(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v).replace(/\s/g, "").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Besleme: liste fiyatı TRY — fiyat tipi 11 */
export function extractProviderTryListPrice11(prices: unknown): number {
  if (prices == null || typeof prices !== "object") return 0;
  const p = prices as Record<string, unknown>;
  const block = p["11"] ?? p[String(11)];
  if (block == null || typeof block !== "object") return 0;
  return toNum((block as Record<string, unknown>).price);
}
