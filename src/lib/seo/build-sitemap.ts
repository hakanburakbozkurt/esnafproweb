import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { getSecondHandDeviceHref } from "@/lib/dukkan/second-hand-devices";
import { createClient } from "@/lib/supabase/server";

type SitemapEntry = MetadataRoute.Sitemap[number];

function sitemapEntry(
  baseUrl: string,
  path: string,
  options?: Partial<Pick<SitemapEntry, "lastModified" | "changeFrequency" | "priority">>
): SitemapEntry {
  return {
    url: path ? `${baseUrl}${path}` : baseUrl,
    ...options,
  };
}

export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    sitemapEntry(baseUrl, "", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    }),
    sitemapEntry(baseUrl, "/fiyatlandirma", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    sitemapEntry(baseUrl, "/giris", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    }),
  ];

  const supabase = await createClient();

  const [{ data: dukkanlar, error: dukkanError }, { data: blogPosts }, { data: devices }] =
    await Promise.all([
      supabase
        .from("dukkanlar")
        .select(
          "id, slug, user_id, updated_at, iletisim_sss_goster, teknik_servis_aktif"
        )
        .eq("aktif", true),
      supabase
        .from("dukkan_blog_yazilari")
        .select("slug, updated_at, dukkan_id")
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

  const devicesByUserId = new Map<
    string,
    NonNullable<typeof devices>
  >();

  for (const device of devices ?? []) {
    if (!device.user_id) continue;

    const userDevices = devicesByUserId.get(device.user_id) ?? [];
    userDevices.push(device);
    devicesByUserId.set(device.user_id, userDevices);
  }

  const dynamicPages: MetadataRoute.Sitemap = [];

  for (const dukkan of stores) {
    const shopBase = `/${dukkan.slug}`;
    const lastModified = dukkan.updated_at ? new Date(dukkan.updated_at) : now;

    dynamicPages.push(
      sitemapEntry(baseUrl, shopBase, {
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
      }),
      sitemapEntry(baseUrl, `${shopBase}/hakkimizda`, {
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      }),
      sitemapEntry(baseUrl, `${shopBase}/blog`, {
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
      })
    );

    if (dukkan.iletisim_sss_goster ?? true) {
      dynamicPages.push(
        sitemapEntry(baseUrl, `${shopBase}/iletisim`, {
          lastModified,
          changeFrequency: "monthly",
          priority: 0.7,
        })
      );
    }

    if (dukkan.teknik_servis_aktif) {
      dynamicPages.push(
        sitemapEntry(baseUrl, `${shopBase}/teknik-servis`, {
          lastModified,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      );
    }

    const userDevices = devicesByUserId.get(dukkan.user_id) ?? [];

    if (userDevices.length > 0) {
      dynamicPages.push(
        sitemapEntry(baseUrl, `${shopBase}/pazaryeri`, {
          lastModified,
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
        const deviceUpdatedAt = device.web_published_at ?? device.created_at;

        dynamicPages.push(
          sitemapEntry(baseUrl, devicePath, {
            lastModified: deviceUpdatedAt ? new Date(deviceUpdatedAt) : lastModified,
            changeFrequency: "weekly",
            priority: 0.5,
          })
        );
      }
    }
  }

  for (const post of blogPosts ?? []) {
    const shopSlug = slugByDukkanId.get(post.dukkan_id);
    if (!shopSlug) continue;

    dynamicPages.push(
      sitemapEntry(baseUrl, `/${shopSlug}/blog/${post.slug}`, {
        lastModified: post.updated_at ? new Date(post.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.5,
      })
    );
  }

  return [...staticPages, ...dynamicPages];
}
