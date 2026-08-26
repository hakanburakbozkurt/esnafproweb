import {
  buildDefaultStoreDescription,
  buildLocalAreaLabel,
} from "@/lib/dukkan/metadata";
import {
  formatSecondHandCondition,
  formatSecondHandPrice,
  getSecondHandDeviceHref,
  getSecondHandDeviceTitle,
} from "@/lib/dukkan/second-hand-devices";
import { PLATFORM_STATIC_ROUTES } from "@/lib/seo/llms-route-map";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";
import { createPublicClient } from "@/lib/supabase/public";

export type LlmsLink = {
  path: string;
  title: string;
  note?: string;
};

export type LlmsStoreCatalog = {
  slug: string;
  name: string;
  summary: string;
  areaLabel: string | null;
  llmsPath: string;
  vitrinPages: LlmsLink[];
  blogPosts: LlmsLink[];
  marketplaceDevices: LlmsLink[];
  totalPublicUrls: number;
};

export type LlmsRootCatalog = {
  generatedAt: string;
  platformPages: LlmsLink[];
  stores: LlmsStoreCatalog[];
};

type StoreRow = {
  id: string;
  slug: string;
  dukkan_adi: string;
  aciklama: string | null;
  adres: string | null;
  user_id: string;
  iletisim_sss_goster: boolean | null;
  teknik_servis_aktif: boolean | null;
  katalog_modu_aktif: boolean | null;
};

type BlogRow = {
  slug: string;
  baslik: string;
  icerik: string | null;
  dukkan_id: string;
};

type DeviceRow = {
  id: string | null;
  user_id: string | null;
  web_slug: string | null;
  web_title: string | null;
  brand: string | null;
  model: string | null;
  condition: string | null;
  sale_price: number | null;
  web_description: string | null;
};

function truncateNote(text: string, maxLength = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function toAbsoluteUrl(path: string): string {
  return buildSitemapUrl(path);
}

function platformPagesFromDefinitions(): LlmsLink[] {
  return PLATFORM_STATIC_ROUTES.filter((route) => route.publicIndexable).map(
    (route) => ({
      path: route.path,
      title: route.title,
      note: route.description,
    })
  );
}

function buildStoreSummary(store: StoreRow): string {
  return buildDefaultStoreDescription({
    dukkan_adi: store.dukkan_adi,
    adres: store.adres,
  });
}

function buildStoreCatalog(
  store: StoreRow,
  blogPosts: BlogRow[],
  devices: DeviceRow[]
): LlmsStoreCatalog {
  const slug = store.slug.trim();
  const base = `/${slug}`;
  const vitrinPages: LlmsLink[] = [
    {
      path: base,
      title: `${store.dukkan_adi} — Vitrin`,
      note: "Ana vitrin: ürünler, konum, SSS, kapak görseli.",
    },
    {
      path: `${base}/hakkimizda`,
      title: "Hakkımızda",
      note: truncateNote(store.aciklama ?? "Mağaza hikayesi ve galeri."),
    },
  ];

  if (store.iletisim_sss_goster ?? true) {
    vitrinPages.push({
      path: `${base}/iletisim`,
      title: "İletişim",
      note: "Telefon, WhatsApp, adres, harita ve iletişim SSS.",
    });
  }

  if (store.teknik_servis_aktif) {
    vitrinPages.push({
      path: `${base}/teknik-servis`,
      title: "Teknik Servis",
      note: "Servis hizmetleri, fotoğraflar ve bilgiler.",
    });
  }

  if (store.katalog_modu_aktif) {
    vitrinPages.push({
      path: `${base}/katalog`,
      title: "Katalog",
      note: "Telefon ve tablet model kataloğu.",
    });
  }

  const storeBlogPosts = blogPosts.filter((post) => post.dukkan_id === store.id);

  if (storeBlogPosts.length > 0) {
    vitrinPages.push({
      path: `${base}/blog`,
      title: "Blog",
      note: `${storeBlogPosts.length} yayınlanmış blog yazısı.`,
    });
  }

  const blogPostLinks: LlmsLink[] = storeBlogPosts.map((post) => ({
    path: `${base}/blog/${post.slug.trim()}`,
    title: post.baslik,
    note: truncateNote(post.icerik ?? post.baslik),
  }));

  const storeDevices = devices.filter((device) => device.user_id === store.user_id);
  const marketplaceDevices: LlmsLink[] = [];

  if (storeDevices.length > 0) {
    vitrinPages.push({
      path: `${base}/pazaryeri`,
      title: "Pazaryeri",
      note: `${storeDevices.length} ikinci el cihaz ilanı.`,
    });

    for (const device of storeDevices) {
      if (!device.id) continue;

      const devicePath = getSecondHandDeviceHref(slug, {
        id: device.id,
        web_slug: device.web_slug,
      });
      const title = getSecondHandDeviceTitle(device);
      const price = formatSecondHandPrice(device.sale_price);
      const condition = formatSecondHandCondition(device.condition);
      const description =
        device.web_description?.trim() ||
        `${title} — ${condition}, ${price}`;

      marketplaceDevices.push({
        path: devicePath,
        title,
        note: truncateNote(description),
      });
    }
  }

  const totalPublicUrls =
    vitrinPages.length + blogPostLinks.length + marketplaceDevices.length;

  return {
    slug,
    name: store.dukkan_adi,
    summary: buildStoreSummary(store),
    areaLabel: buildLocalAreaLabel(store.adres),
    llmsPath: `${base}/llms.txt`,
    vitrinPages,
    blogPosts: blogPostLinks,
    marketplaceDevices,
    totalPublicUrls,
  };
}

async function fetchPublicCatalogData(): Promise<{
  stores: StoreRow[];
  blogPosts: BlogRow[];
  devices: DeviceRow[];
} | null> {
  let supabase;

  try {
    supabase = createPublicClient();
  } catch (error) {
    console.error("[llms.txt] Supabase client error:", error);
    return null;
  }

  const [{ data: stores, error: storeError }, { data: blogPosts }, { data: devices }] =
    await Promise.all([
      supabase
        .from("dukkanlar")
        .select(
          "id, slug, dukkan_adi, aciklama, adres, user_id, iletisim_sss_goster, teknik_servis_aktif, katalog_modu_aktif"
        )
        .eq("aktif", true)
        .eq("approval_status", "active")
        .order("dukkan_adi", { ascending: true }),
      supabase
        .from("dukkan_blog_yazilari")
        .select("slug, baslik, icerik, dukkan_id")
        .eq("yayinda", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("second_hand_devices_public")
        .select(
          "id, user_id, web_slug, web_title, brand, model, condition, sale_price, web_description"
        )
        .eq("web_published", true),
    ]);

  if (storeError) {
    console.error("[llms.txt] dukkanlar fetch error:", storeError.message);
    return null;
  }

  return {
    stores: (stores ?? []).filter((store) => store.slug?.trim()),
    blogPosts: blogPosts ?? [],
    devices: devices ?? [],
  };
}

export async function buildLlmsRootCatalog(): Promise<LlmsRootCatalog> {
  const platformPages = platformPagesFromDefinitions();
  const data = await fetchPublicCatalogData();

  if (!data) {
    return {
      generatedAt: new Date().toISOString(),
      platformPages,
      stores: [],
    };
  }

  const stores = data.stores.map((store) =>
    buildStoreCatalog(store, data.blogPosts, data.devices)
  );

  return {
    generatedAt: new Date().toISOString(),
    platformPages,
    stores,
  };
}

export async function buildLlmsStoreCatalog(
  slug: string
): Promise<LlmsStoreCatalog | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  const data = await fetchPublicCatalogData();
  if (!data) return null;

  const store = data.stores.find(
    (item) => item.slug.trim().toLowerCase() === normalizedSlug
  );

  if (!store) return null;

  return buildStoreCatalog(store, data.blogPosts, data.devices);
}

export function formatLlmsLinkList(links: LlmsLink[]): string[] {
  return links.map((link) => {
    const url = toAbsoluteUrl(link.path);
    if (link.note?.trim()) {
      return `- [${link.title}](${url}): ${link.note.trim()}`;
    }
    return `- [${link.title}](${url})`;
  });
}
