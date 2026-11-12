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

/**
 * Vitrinde gösterilecek fiyat metni. Esnaf sadece rakam yazdıysa ("2250")
 * "2.250 TL" olarak gösterilir; zaten para birimi ya da metin varsa
 * ("1.350 ₺", "Sorunuz") yazıldığı gibi bırakılır.
 */
export function formatUrunFiyatiGosterim(fiyat: string | null | undefined): string | null {
  const ham = fiyat?.trim();
  if (!ham) return null;
  if (/[^\d.,\s]/.test(ham)) return ham;
  const sayi = parseUrunFiyati(ham);
  if (sayi == null) return ham;
  const ondalikli = !Number.isInteger(sayi);
  return `${sayi.toLocaleString("tr-TR", {
    minimumFractionDigits: ondalikli ? 2 : 0,
    maximumFractionDigits: 2,
  })} TL`;
}

/**
 * Fiyat kutusuna yazılırken binlik noktası koyar: "1350" → "1.350",
 * "1350,5" → "1.350,5". Kuruş için virgül kullanılır (en fazla 2 hane).
 * Kutuya harf/para birimi yazıldıysa ("450 TL", "Sorunuz") dokunmaz.
 */
export function formatFiyatGirisi(deger: string): string {
  if (/[^\d.,\s]/.test(deger)) return deger;
  const temiz = deger.replace(/[\s.]/g, "");
  if (!temiz) return "";
  const [tam, ...kalan] = temiz.split(",");
  const tamSade = tam.replace(/^0+(?=\d)/, "");
  const gruplu = tamSade.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const ondalik = kalan.length ? `,${kalan.join("").slice(0, 2)}` : "";
  return `${gruplu}${ondalik}`;
}
