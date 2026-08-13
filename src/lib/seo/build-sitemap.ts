import type { MetadataRoute } from "next";
import { getSecondHandDeviceHref } from "@/lib/dukkan/second-hand-devices";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";
import { createPublicClient } from "@/lib/supabase/public";

type SitemapEntry = MetadataRoute.Sitemap[number];

function safeDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function latestDate(...dates: Date[]): Date {
  return dates.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest
  );
}

function sitemapEntry(
  path: string,
  lastModified: Date,
  options?: Partial<Pick<SitemapEntry, "changeFrequency" | "priority">>
): SitemapEntry {
  return {
    url: buildSitemapUrl(path),
    lastModified,
    ...options,
  };
}

function staticSitemapEntries(now: Date): MetadataRoute.Sitemap {
  return [
    sitemapEntry("", now, {
      changeFrequency: "weekly",
      priority: 1,
    }),
    sitemapEntry("/fiyatlandirma", now, {
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    sitemapEntry("/blog", now, {
      changeFrequency: "weekly",
      priority: 0.7,
    }),
    sitemapEntry("/esnaflar", now, {
      changeFrequency: "weekly",
      priority: 0.7,
    }),
    sitemapEntry("/giris", now, {
      changeFrequency: "monthly",
      priority: 0.4,
    }),
  ];
}

export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = staticSitemapEntries(now);

  let supabase;

  try {
    supabase = createPublicClient();
  } catch (error) {
    console.error("[sitemap] Supabase client error:", error);
    return staticPages;
  }

  const [{ data: dukkanlar, error: dukkanError }, { data: blogPosts }, { data: devices }] =
    await Promise.all([
      supabase
        .from("dukkanlar")
        .select(
          "id, slug, user_id, updated_at, created_at, iletisim_sss_goster, teknik_servis_aktif"
        )
        .eq("aktif", true),
      supabase
        .from("dukkan_blog_yazilari")
        .select("slug, updated_at, created_at, dukkan_id")
        .eq("yayinda", true),
      supabase
        .from("second_hand_devices_public")
        .select("id, user_id, web_slug, web_published_at, created_at")
        .eq("web_published", true),
    ]);

  if (dukkanError) {
    console.error("[sitemap] dukkanlar fetch error:", dukkanError.message);
    return staticPages;
  }

  const stores = dukkanlar ?? [];
  const slugByDukkanId = new Map(stores.map((dukkan) => [dukkan.id, dukkan.slug]));

  const blogPostsByDukkanId = new Map<string, NonNullable<typeof blogPosts>>();

  for (const post of blogPosts ?? []) {
    const posts = blogPostsByDukkanId.get(post.dukkan_id) ?? [];
    posts.push(post);
    blogPostsByDukkanId.set(post.dukkan_id, posts);
  }

  const devicesByUserId = new Map<string, NonNullable<typeof devices>>();

  for (const device of devices ?? []) {
    if (!device.user_id) continue;

    const userDevices = devicesByUserId.get(device.user_id) ?? [];
    userDevices.push(device);
    devicesByUserId.set(device.user_id, userDevices);
  }

  const dynamicPages: MetadataRoute.Sitemap = [];

  for (const dukkan of stores) {
    if (!dukkan.slug?.trim()) continue;

    const shopBase = `/${dukkan.slug.trim()}`;
    const storeLastModified = safeDate(
      dukkan.updated_at ?? dukkan.created_at,
      now
    );

    const storeBlogPosts = blogPostsByDukkanId.get(dukkan.id) ?? [];
    const blogIndexLastModified =
      storeBlogPosts.length > 0
        ? latestDate(
            storeLastModified,
            ...storeBlogPosts.map((post) =>
              safeDate(post.updated_at ?? post.created_at, storeLastModified)
            )
          )
        : storeLastModified;

    const userDevices = devicesByUserId.get(dukkan.user_id) ?? [];
    const pazaryeriLastModified =
      userDevices.length > 0
        ? latestDate(
            storeLastModified,
            ...userDevices.map((device) =>
              safeDate(
                device.web_published_at ?? device.created_at,
                storeLastModified
              )
            )
          )
        : storeLastModified;

    dynamicPages.push(
      sitemapEntry(shopBase, storeLastModified, {
        changeFrequency: "weekly",
        priority: 0.9,
      }),
      sitemapEntry(`${shopBase}/hakkimizda`, storeLastModified, {
        changeFrequency: "monthly",
        priority: 0.6,
      }),
      sitemapEntry(`${shopBase}/blog`, blogIndexLastModified, {
        changeFrequency: "weekly",
        priority: 0.6,
      })
    );

    if (dukkan.iletisim_sss_goster ?? true) {
      dynamicPages.push(
        sitemapEntry(`${shopBase}/iletisim`, storeLastModified, {
          changeFrequency: "monthly",
          priority: 0.7,
        })
      );
    }

    if (dukkan.teknik_servis_aktif) {
      dynamicPages.push(
        sitemapEntry(`${shopBase}/teknik-servis`, storeLastModified, {
          changeFrequency: "monthly",
          priority: 0.6,
        })
      );
    }

    if (userDevices.length > 0) {
      dynamicPages.push(
        sitemapEntry(`${shopBase}/pazaryeri`, pazaryeriLastModified, {
          changeFrequency: "daily",
          priority: 0.7,
        })
      );

      for (const device of userDevices) {
        if (!device.id) continue;

        const devicePath = getSecondHandDeviceHref(dukkan.slug, {
          id: device.id,
          web_slug: device.web_slug,
        });
        const deviceLastModified = safeDate(
          device.web_published_at ?? device.created_at,
          storeLastModified
        );

        dynamicPages.push(
          sitemapEntry(devicePath, deviceLastModified, {
            changeFrequency: "weekly",
            priority: 0.5,
          })
        );
      }
    }
  }

  for (const post of blogPosts ?? []) {
    const shopSlug = slugByDukkanId.get(post.dukkan_id);
    if (!shopSlug || !post.slug?.trim()) continue;

    const postSlug = post.slug.trim();
    const lastModified = safeDate(post.updated_at ?? post.created_at, now);

    dynamicPages.push(
      sitemapEntry(`/${shopSlug}/blog/${postSlug}`, lastModified, {
        changeFrequency: "monthly",
        priority: 0.5,
      }),
      sitemapEntry(`/blog/${postSlug}`, lastModified, {
        changeFrequency: "monthly",
        priority: 0.55,
      })
    );
  }

  return [...staticPages, ...dynamicPages];
}
