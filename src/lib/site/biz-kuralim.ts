import { SITE_CONTACT } from "@/lib/site/contact";

/**
 * "Sayfanı biz kuralım" teklifi: esnaf WhatsApp'tan bilgilerini gönderir,
 * ekip sayfayı admin panelindeki "Esnaf adına kur" ekranından kurar.
 * Mesaj, ekibin ihtiyaç duyduğu bilgileri düzenli toplamak için hazır gelir.
 */
export const BIZ_KURALIM_MESAJI = [
  "Merhaba, EsnafPRO'da mağaza sayfamı kurmanızı istiyorum.",
  "",
  "Dükkan adı:",
  "Şehir / semt:",
  "Telefon:",
  "E-posta:",
  "",
  "Dükkan ve ürün fotoğraflarımı bu mesajın ardından gönderiyorum.",
].join("\n");

export function buildBizKuralimUrl(kaynak?: string): string {
  const mesaj = kaynak ? `${BIZ_KURALIM_MESAJI}\n\n(${kaynak})` : BIZ_KURALIM_MESAJI;
  return `https://wa.me/${SITE_CONTACT.whatsappNumber}?text=${encodeURIComponent(mesaj)}`;
}
