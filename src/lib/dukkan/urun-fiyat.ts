/**
 * Ürün fiyatı formda serbest metin olarak tutulur ("1350", "1.350 TL", "1.350,50 ₺").
 * Yapılandırılmış veri (JSON-LD) için sayıya çevirir; anlaşılamazsa null döner
 * ki arama motoruna yanlış fiyat gitmesin.
 */
export function parseUrunFiyati(fiyat: string | null | undefined): number | null {
  const ham = fiyat?.trim();
  if (!ham) return null;

  const sadece = ham.replace(/[^\d.,]/g, "");
  if (!/\d/.test(sadece)) return null;
  // Metin rakam dışında anlamlı içerik taşıyorsa ("1350-1500", "200 / 300") fiyat değildir.
  if (/\d\s*[-/]\s*\d/.test(ham)) return null;

  let normal: string;
  if (sadece.includes(",")) {
    // Türkçe biçim: nokta binlik, virgül ondalık
    normal = sadece.replace(/\./g, "").replace(",", ".");
  } else {
    const noktalar = sadece.split(".").length - 1;
    const sonParca = sadece.split(".").pop() ?? "";
    normal = noktalar > 1 || (noktalar === 1 && sonParca.length === 3) ? sadece.replace(/\./g, "") : sadece;
  }

  const sayi = Number(normal);
  if (!Number.isFinite(sayi) || sayi <= 0) return null;
  return Math.round(sayi * 100) / 100;
}
