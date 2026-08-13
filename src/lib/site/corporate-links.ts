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
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/blog", label: "Esnaf Rehberi" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];
