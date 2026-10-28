/**
 * Platform iletişim bilgileri — tek kaynak.
 * İletişim, Hakkımızda ve footer bu dosyadan okur; değişiklik yalnızca burada yapılır.
 */
const ADDRESS_LINES = [
  "Çarşıpazarkent AVM, 1. Kat",
  "Aşık Veysel, Reşneli Niyazi Sk. No:4/49",
  "34510 Esenyurt / İstanbul",
] as const;

export const SITE_CONTACT = {
  email: "esnafpanelpro@gmail.com",
  /** Ekranda görünen biçim */
  phoneDisplay: "0553 955 91 11",
  /** tel: bağlantısı için uluslararası biçim */
  phoneTel: "+905539559111",
  /** wa.me için ülke kodlu, artı işaretsiz numara */
  whatsappNumber: "905539559111",
  addressLines: ADDRESS_LINES,
} as const;

export const SITE_CONTACT_ADDRESS = ADDRESS_LINES.join(", ");

export const SITE_CONTACT_LINKS = {
  mailto: `mailto:${SITE_CONTACT.email}`,
  tel: `tel:${SITE_CONTACT.phoneTel}`,
  whatsapp: `https://wa.me/${SITE_CONTACT.whatsappNumber}`,
  maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Beep Mobile Store ${SITE_CONTACT_ADDRESS}`
  )}`,
} as const;
