import type { MetadataRoute } from "next";
import { SITEMAP_CANONICAL_ORIGIN } from "@/lib/seo/sitemap-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/yonetim",
        "/yonetim/",
        "/dukkan-ayarlari",
        "/dukkan-ac",
        "/toptanci-ac",
        "/toptanci-ayarlari",
        "/toptanci/xml-yukle",
        "/auth/",
        "/yeni-sifre",
        "/sifre-sifirla",
      ],
    },
    sitemap: `${SITEMAP_CANONICAL_ORIGIN}/sitemap.xml`,
  };
}
