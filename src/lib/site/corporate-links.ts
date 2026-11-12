export type CorporateFooterLink = {
  href: string;
  label: string;
};

/**
 * Platform (landing) footer kurumsal linkleri.
 * Yeni bir statik sayfa eklediğinizde buraya kaydedin — footer otomatik güncellenir.
 */
export const CORPORATE_FOOTER_LINKS: CorporateFooterLink[] = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/pazaryeri", label: "Pazaryeri" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/tamir-fiyati", label: "Tamir Fiyatı Al" },
  { href: "/blog", label: "Esnaf Rehberi" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/kvkk-aydinlatma-metni", label: "KVKK Aydınlatma Metni" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/on-bilgilendirme-formu", label: "Ön Bilgilendirme Formu" },
];
