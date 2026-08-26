import {
  AUTH_ROUTES,
  PLATFORM_DYNAMIC_ROUTES,
} from "@/lib/seo/llms-route-map";
import {
  buildLlmsRootCatalog,
  buildLlmsStoreCatalog,
  formatLlmsLinkList,
  type LlmsStoreCatalog,
} from "@/lib/seo/llms-catalog";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";

export const LLMS_TXT_RESPONSE_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
} as const;

const SITE_ORIGIN = buildSitemapUrl();

function renderStoreSection(store: LlmsStoreCatalog): string[] {
  const area = store.areaLabel ? ` (${store.areaLabel})` : "";
  const llmsUrl = buildSitemapUrl(store.llmsPath);

  return [
    `- [${store.name} — llms.txt](${llmsUrl}): ${store.totalPublicUrls} public URL${area}`,
    `- [${store.name} — Vitrin](${buildSitemapUrl(`/${store.slug}`)}): ${truncateInline(store.summary, 120)}`,
  ];
}

function truncateInline(text: string, max: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}…`;
}

export async function renderRootLlmsTxt(): Promise<string> {
  const catalog = await buildLlmsRootCatalog();
  const totalStoreUrls = catalog.stores.reduce(
    (sum, store) => sum + store.totalPublicUrls,
    0
  );

  const lines: string[] = [
    "# EsnafPRO",
    "",
    "> Telefon ve teknik servis esnafı için Türkiye merkezli dijital vitrin, ikinci el pazaryeri, servis takibi ve işletme yönetim platformu.",
    "",
    "Bu dosya EsnafPRO platformunun public URL envanterini listeler. Site iki katmandan oluşur:",
    "",
    "1. **Platform sayfaları** — `esnafpro.app` kökündeki kurumsal ve agregasyon sayfaları.",
    "2. **Esnaf vitrinleri** — Her onaylı dükkanın `/{slug}/...` altındaki yerel dijital mağazası.",
    "",
    "Her dükkanın tüm alt sayfaları (blog, pazaryeri ilanları, iletişim vb.) ilgili `/{slug}/llms.txt` dosyasında ayrıntılı listelenir. AI ajanları önce bu dosyayı, ardından ilgili dükkan llms.txt dosyasını okumalıdır.",
    "",
    `Dil: Türkçe (tr-TR). Kanonik köken: ${SITE_ORIGIN}. Son güncelleme: ${catalog.generatedAt}. Aktif dükkan: ${catalog.stores.length}. Toplam vitrin URL (tüm dükkanlar): ${totalStoreUrls}.`,
    "",
    "## Platform Sayfaları",
    "",
    ...formatLlmsLinkList(catalog.platformPages),
    "",
    "## Esnaf Vitrinleri",
    "",
  ];

  if (catalog.stores.length > 0) {
    lines.push(...catalog.stores.flatMap((store) => renderStoreSection(store)));
  } else {
    lines.push(
      "- Henüz indekslenebilir aktif dükkan yok. Güncel liste için sitemap.xml kullanın."
    );
  }

  lines.push(
    "",
    "## Makine Kaynakları",
    "",
    `- [Sitemap](${buildSitemapUrl("/sitemap.xml")}): XML formatında tüm indekslenebilir URL'ler`,
    `- [Robots](${buildSitemapUrl("/robots.txt")}): Tarama kuralları`,
    `- [Platform llms.txt](${buildSitemapUrl("/llms.txt")}): Bu dosya`,
    "",
    "## Platform Dinamik Rotalar",
    "",
    ...PLATFORM_DYNAMIC_ROUTES.map(
      (route) =>
        `- \`${route.path}\`: ${route.description}`
    ),
    "",
    "## Optional",
    "",
    "Aşağıdaki sayfalar oturum, yönetim veya işlem amaçlıdır; içerik taraması için gerekli değildir.",
    "",
    ...AUTH_ROUTES.map(
      (route) =>
        `- [${route.title}](${buildSitemapUrl(route.path)}): ${route.description}`
    ),
    "",
    `- \`/yonetim/*\`: Esnaf ve süper admin yönetim paneli (robots.txt: disallow)`,
    `- \`/auth/callback\`: Supabase kimlik doğrulama geri dönüşü`,
    `- \`/servis-takip/[device_code]\`: QR ile açılan cihaz bazlı servis durumu (genel tarama hedefi değil)`,
    ""
  );

  return lines.join("\n");
}

export async function renderStoreLlmsTxt(slug: string): Promise<string | null> {
  const store = await buildLlmsStoreCatalog(slug);
  if (!store) return null;

  const lines: string[] = [
    `# ${store.name}`,
    "",
    `> ${store.summary}`,
    "",
    `${store.name} EsnafPRO dijital vitrin alanı. Üst platform haritası: [EsnafPRO llms.txt](${buildSitemapUrl("/llms.txt")}).`,
    "",
    store.areaLabel
      ? `Konum sinyali: ${store.areaLabel}. Slug: \`${store.slug}\`.`
      : `Slug: \`${store.slug}\`.`,
    "",
    `Toplam public URL: ${store.totalPublicUrls}.`,
    "",
    "## Vitrin Sayfaları",
    "",
    ...formatLlmsLinkList(store.vitrinPages),
  ];

  if (store.blogPosts.length > 0) {
    lines.push("", "## Blog Yazıları", "", ...formatLlmsLinkList(store.blogPosts));
  }

  if (store.marketplaceDevices.length > 0) {
    lines.push(
      "",
      "## Pazaryeri İlanları",
      "",
      ...formatLlmsLinkList(store.marketplaceDevices)
    );
  }

  lines.push(
    "",
    "## İlgili Platform Sayfaları",
    "",
    `- [Esnaf Rehberi — Blog İndeksi](${buildSitemapUrl("/blog")}): Tüm mağaza blog yazıları`,
    `- [İkinci El Pazaryeri](${buildSitemapUrl("/pazaryeri")}): Platform geneli ilan agregasyonu`,
    `- [Esnaf Vitrini](${buildSitemapUrl("/esnaflar")}): Aktif dükkan listesi`,
    `- [Sitemap](${buildSitemapUrl("/sitemap.xml")}): XML site haritası`,
    ""
  );

  return lines.join("\n");
}
