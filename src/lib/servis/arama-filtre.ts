/**
 * PostgREST .or() filtresi için güvenli arama ifadesi.
 * Serbest metin, filtre sözdizimini bozamaz: ayraç ve özel karakterler
 * temizlenir, kalan değer çift tırnak içine alınır.
 */
export function servisAramaOrFiltresi(aranan: string): string | null {
  const temiz = aranan
    .replace(/[\\"'%_*(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!temiz) return null;
  const desen = `"%${temiz}%"`;
  return `customer_name.ilike.${desen},customer_phone.ilike.${desen},device_info.ilike.${desen}`;
}
