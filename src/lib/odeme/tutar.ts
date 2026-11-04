/** Kuruş hassasiyetinde tutar karşılaştırması (istemci ve sunucuda kullanılabilir) */
export function tutarlarEsit(a: number | string, b: number | string): boolean {
  const x = Math.round(Number(a) * 100);
  const y = Math.round(Number(b) * 100);
  return Number.isFinite(x) && Number.isFinite(y) && x === y;
}
