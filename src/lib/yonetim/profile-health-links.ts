/** Skor maddesini dolduracağı ayar sayfasına eşler (etiket metnine göre). */
export function getBreakdownHref(label: string): string {
  if (label === "Logo" || label === "Kapak fotoğrafı") return "/dukkan-ayarlari#ayar-gorseller";
  if (label.startsWith("Hakkımızda")) return "/dukkan-ayarlari#ayar-hakkimizda";
  if (label.startsWith("İletişim")) return "/dukkan-ayarlari#ayar-iletisim";
  if (label.startsWith("Konum")) return "/dukkan-ayarlari#ayar-konum";
  if (label.startsWith("SSS")) return "/dukkan-ayarlari#ayar-sss";
  if (label.startsWith("Yerel blog")) return "/yonetim/blog/yeni";
  return "/dukkan-ayarlari";
}
