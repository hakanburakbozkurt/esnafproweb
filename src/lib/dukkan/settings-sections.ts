export const DUKKAN_SETTINGS_SECTIONS = [
  { id: "ayar-temel", label: "Temel bilgiler" },
  { id: "ayar-urunler", label: "Ürünler" },
  { id: "ayar-seo", label: "SEO" },
  { id: "ayar-gorseller", label: "Görseller" },
  { id: "ayar-hakkimizda", label: "Hakkımızda" },
  { id: "ayar-iletisim", label: "İletişim" },
  { id: "ayar-konum", label: "Konum" },
  { id: "ayar-sss", label: "SSS" },
  { id: "ayar-moduller", label: "Modüller" },
] as const;

export type DukkanSettingsSectionId =
  (typeof DUKKAN_SETTINGS_SECTIONS)[number]["id"];

export type DukkanSettingsSection = (typeof DUKKAN_SETTINGS_SECTIONS)[number];

/** Yapışkan başlıkların altında kalmaması için bölüm kaydırma payı */
export const SETTINGS_SECTION_SCROLL_MARGIN_CLASS = "scroll-mt-48 lg:scroll-mt-40";

export function getDukkanSettingsSections(options: {
  showSeo: boolean;
}): DukkanSettingsSection[] {
  return DUKKAN_SETTINGS_SECTIONS.filter(
    (section) => options.showSeo || section.id !== "ayar-seo"
  );
}
