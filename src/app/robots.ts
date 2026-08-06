import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/auth/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/yonetim", "/yonetim/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
