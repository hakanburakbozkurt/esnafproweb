import type { NextApiRequest, NextApiResponse } from "next";
import { buildSitemap } from "@/lib/seo/build-sitemap";
import { buildSitemapUrl } from "@/lib/seo/sitemap-url";
import { buildSitemapXml } from "@/lib/seo/sitemap-xml";

function fallbackSitemapXml(): string {
  const now = new Date();

  return buildSitemapXml([
    {
      url: buildSitemapUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildSitemapUrl("/fiyatlandirma"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end();
  }

  try {
    const entries = await buildSitemap();
    const xml = buildSitemapXml(entries);

    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");

    if (req.method === "HEAD") {
      return res.status(200).end();
    }

    return res.status(200).send(xml);
  } catch (error) {
    console.error("[sitemap] generation failed:", error);

    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

    if (req.method === "HEAD") {
      return res.status(200).end();
    }

    return res.status(200).send(fallbackSitemapXml());
  }
}
