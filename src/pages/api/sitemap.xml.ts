import type { NextApiRequest, NextApiResponse } from "next";
import {
  renderSitemapXml,
  SITEMAP_RESPONSE_HEADERS,
} from "@/lib/seo/render-sitemap";

/**
 * Pages API — App Router layout/RSC/script enjeksiyonunu tamamen bypass eder.
 * /sitemap.xml adresi next.config rewrites ile buraya yönlendirilir.
 */
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

function applyHeaders(
  res: NextApiResponse,
  headers: Record<string, string>
): void {
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).end();
    return;
  }

  const xml = await renderSitemapXml();

  applyHeaders(res, SITEMAP_RESPONSE_HEADERS);

  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  res.status(200).end(xml, "utf8");
}
