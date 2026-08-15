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
];
