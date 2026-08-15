/**
 * FPPRO iPhone tamir fiyatlarını JSON'a aktarır.
 * Kullanım: node scripts/scrape-fppro-iphone-prices.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://fpprotr.com/cihazimi-tamir-et/iphone-serileri/";
const ROOT = "https://fpprotr.com";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "..", "data", "fppro-iphone-repair-prices.json");

const SERIES_SLUGS = [
  "iphone-17-serisi",
  "iphone-16-serisi",
  "iphone-15-serisi",
  "iphone-14-serisi",
  "iphone-13-serisi",
  "iphone-12-serisi",
  "iphone-11-serisi",
  "iphone-x-serisi",
  "iphone-8-serisi",
  "iphone-se-serisi",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; EsnafProWeb/1.0; +https://esnafpro.app)",
      Accept: "text/html",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }

  return response.text();
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parsePriceToNumber(priceDisplay) {
  const normalized = priceDisplay.replace(/[^\d,]/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

function extractLinks(html, pattern) {
  const links = new Set();
  const regex = new RegExp(pattern, "gi");
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.add(match[1].split("#")[0].replace(/\/$/, "") + "/");
  }
  return [...links];
}

function extractSeriesName(html) {
  const match = html.match(
    /<h1 class="elementor-heading-title[^"]*">\s*([^<]+?)\s*<\/h1>/i
  );
  return decodeHtml(match?.[1] ?? "");
}

function extractModelLinksFromSeries(html, seriesSlug) {
  const prefix = `/cihazimi-tamir-et/iphone-serileri/${seriesSlug}/`;
  const escapedPrefix = prefix.replace(/\//g, "\\/");

  const hrefPattern = `href="(https://fpprotr\\.com${escapedPrefix}[^"#?]+/?)"`;
  const clickablePattern = `data-column-clickable="(https://fpprotr\\.com${escapedPrefix}[^"#?]+/?)"`;

  const links = new Set([
    ...extractLinks(html, hrefPattern),
    ...extractLinks(html, clickablePattern),
  ]);

  return [...links]
    .filter((url) => {
      const path = new URL(url).pathname.replace(/\/$/, "");
      const parts = path.split("/").filter(Boolean);
      return parts.length === 4 && parts[3] !== seriesSlug;
    })
    .sort();
}

function parseModelPage(html, url) {
  const modelName =
    extractSeriesName(html) ||
    decodeHtml(
      html.match(/<title>([^|<]+)/i)?.[1]?.replace(/Tamir Fiyatları.*/i, "").trim() ??
        ""
    );

  const slug = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
  const categories = [];
  let currentCategory = "Genel";

  const tokenRegex =
    /<h2 class="elementor-heading-title[^"]*">\s*([^<]+?)\s*<\/h2>|<ul class="elementor-price-list">([\s\S]*?)<\/ul>/gi;

  let match;
  while ((match = tokenRegex.exec(html)) !== null) {
    if (match[1]) {
      currentCategory = decodeHtml(match[1]);
      continue;
    }

    const listHtml = match[2];
    const itemRegex =
      /<li class="elementor-price-list-item">[\s\S]*?<span class="elementor-price-list-title">\s*([\s\S]*?)\s*<\/span>[\s\S]*?<span class="elementor-price-list-price">\s*([\s\S]*?)\s*<\/span>(?:[\s\S]*?<p class="elementor-price-list-description">\s*([\s\S]*?)\s*<\/p>)?/gi;

    const services = [];
    let itemMatch;
    while ((itemMatch = itemRegex.exec(listHtml)) !== null) {
      const serviceName = decodeHtml(itemMatch[1].replace(/<[^>]+>/g, ""));
      const priceDisplay = decodeHtml(itemMatch[2].replace(/<[^>]+>/g, ""));
      const description = decodeHtml(
        (itemMatch[3] ?? "").replace(/<[^>]+>/g, "")
      );

      if (!serviceName || !priceDisplay) continue;

      services.push({
        service: serviceName,
        price_display: priceDisplay,
        price: parsePriceToNumber(priceDisplay),
        description: description || null,
      });
    }

    if (services.length) {
      categories.push({
        category: currentCategory,
        services,
      });
    }
  }

  const flatServices = categories.flatMap((category, categoryIndex) =>
    category.services.map((service, serviceIndex) => ({
      order: categoryIndex * 100 + serviceIndex + 1,
      category: category.category,
      ...service,
    }))
  );

  return {
    model: modelName,
    slug,
    url,
    categories,
    services: flatServices,
    service_count: flatServices.length,
  };
}

async function main() {
  const result = {
    source: BASE,
    scraped_at: new Date().toISOString(),
    currency: "TRY",
    disclaimer:
      "Fiyatlar fpprotr.com sitesinden otomatik çekilmiştir. Güncelliği kontrol edin; ticari kullanım öncesi kaynak siteyi doğrulayın.",
    series: [],
    totals: {
      series: 0,
      models: 0,
      services: 0,
    },
  };

  for (const seriesSlug of SERIES_SLUGS) {
    const seriesUrl = `${ROOT}/cihazimi-tamir-et/iphone-serileri/${seriesSlug}/`;
    process.stdout.write(`Seri: ${seriesSlug}\n`);

    let seriesHtml;
    try {
      seriesHtml = await fetchHtml(seriesUrl);
    } catch (error) {
      process.stderr.write(`  Hata: ${error.message}\n`);
      continue;
    }

    const seriesEntry = {
      series: extractSeriesName(seriesHtml) || seriesSlug,
      slug: seriesSlug,
      url: seriesUrl,
      models: [],
    };

    const modelLinks = extractModelLinksFromSeries(seriesHtml, seriesSlug);
    process.stdout.write(`  ${modelLinks.length} model\n`);

    for (const modelUrl of modelLinks) {
      process.stdout.write(`    ${modelUrl}\n`);
      try {
        const modelHtml = await fetchHtml(modelUrl);
        const parsed = parseModelPage(modelHtml, modelUrl);
        seriesEntry.models.push(parsed);
        result.totals.services += parsed.service_count;
        await sleep(350);
      } catch (error) {
        process.stderr.write(`      Hata: ${error.message}\n`);
      }
    }

    result.totals.models += seriesEntry.models.length;
    result.series.push(seriesEntry);
    result.totals.series += 1;
    await sleep(500);
  }

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(result, null, 2), "utf8");
  process.stdout.write(`\nKaydedildi: ${OUTPUT}\n`);
  process.stdout.write(
    `${result.totals.series} seri, ${result.totals.models} model, ${result.totals.services} fiyat\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
