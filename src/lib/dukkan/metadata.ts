/** Vitrin sayfaları için SEO metadata — meta_* boşsa dükkan adı/açıklamasına düşer */
export type DukkanMetadataSource = {
  dukkan_adi: string;
  aciklama?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

export function buildDukkanPageMetadata(dukkan: DukkanMetadataSource): {
  title: string;
  description: string;
} {
  const title =
    dukkan.meta_title?.trim() || `${dukkan.dukkan_adi} | EsnafPRO`;

  const description =
    dukkan.meta_description?.trim() ||
    dukkan.aciklama?.trim() ||
    `${dukkan.dukkan_adi} dijital vitrin sayfası`;

  return { title, description };
}
