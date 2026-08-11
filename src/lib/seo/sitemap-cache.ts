import { revalidatePath } from "next/cache";

/** ISR yedek süresi: bu aralıkta sitemap yeniden üretilir (saniye) */
export const SITEMAP_REVALIDATE_SECONDS = 600;

/** Mağaza/blog vb. değişince sitemap önbelleğini anında temizler */
export function revalidateSitemap() {
  revalidatePath("/sitemap.xml");
  revalidatePath("/api/sitemap.xml");
}
