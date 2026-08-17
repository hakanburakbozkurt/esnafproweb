const BRAND_ICON_DIR = "/tamir-icons/brands";
const MODEL_ICON_DIR = "/tamir-icons/models";

const ICON_EXTENSIONS = [".png", ".webp", ".jpg", ".svg"] as const;

const APPLE_CDN =
  "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is";
const APPLE_IMG_PARAMS = "?wid=532&hei=660&fmt=png-alpha&.v=1";

const MODEL_CDN_MAP: Record<string, string> = {
  "iphone-17-pro-max": "iphone-17-pro-max-titanium-select",
  "iphone-17-pro": "iphone-17-pro-titanium-select",
  "iphone-17-air": "iphone-17e-pink-select",
  "iphone-17": "iphone-17-teal-select",
  "iphone-17e": "iphone-17e-pink-select",
  "iphone-16-pro-max": "iphone-16-pro-max-desert-titanium-select",
  "iphone-16-pro": "iphone-16-pro-desert-titanium-select",
  "iphone-16-plus": "iphone-16-plus-teal-select",
  "iphone-16": "iphone-16-teal-select",
  "iphone-16e": "iphone-16e-white-select",
  "iphone-15-pro-max": "iphone-15-pro-max-natural-titanium-select",
  "iphone-15-pro": "iphone-15-pro-natural-titanium-select",
  "iphone-15-plus": "iphone-15-plus-pink-select",
  "iphone-15": "iphone-15-pink-select",
  "iphone-14-pro-max": "iphone-14-pro-max-deep-purple-select",
  "iphone-14-pro": "iphone-14-pro-deep-purple-select",
  "iphone-14-plus": "iphone-14-plus-midnight-select",
  "iphone-14": "iphone-14-midnight-select",
  "iphone-13-pro-max": "iphone-13-pro-max-sierra-blue-select",
  "iphone-13-pro": "iphone-13-pro-sierra-blue-select",
  "iphone-13-mini": "iphone-13-mini-midnight-select",
  "iphone-13": "iphone-13-midnight-select",
  "iphone-12-pro-max": "iphone-12-pro-max-pacific-blue-select",
  "iphone-12-pro": "iphone-12-pro-pacific-blue-select",
  "iphone-12-mini": "iphone-12-mini-blue-select",
  "iphone-12": "iphone-12-blue-select",
  "iphone-11-pro-max": "iphone-11-pro-max-midnight-green-select",
  "iphone-11-pro": "iphone-11-pro-midnight-green-select",
  "iphone-11": "iphone-11-black-select",
  "iphone-xs-max": "iphone-xs-max-space-gray-select",
  "iphone-xs": "iphone-xs-space-gray-select",
  "iphone-xr": "iphone-xr-black-select",
  "iphone-x": "iphone-x-space-gray-select",
  "iphone-8-plus": "iphone-8-plus-space-gray-select",
  "iphone-8": "iphone-8-space-gray-select",
  "iphone-se-2022": "iphone-se-3gen-midnight-select",
  "iphone-se-2020": "iphone-se-2020-black-select",
  "iphone-se-2016": "iphone-se-rose-gold-select",
};

function buildLocalIconPaths(baseDir: string, slug: string): string[] {
  return ICON_EXTENSIONS.map((ext) => `${baseDir}/${slug}${ext}`);
}

export function getTamirBrandIconSources(
  slug: string,
  dbUrl?: string | null
): string[] {
  const sources = buildLocalIconPaths(BRAND_ICON_DIR, slug);
  if (dbUrl) sources.push(dbUrl);
  return sources;
}

export function getTamirModelIconSources(
  slug: string,
  dbUrl?: string | null
): string[] {
  const sources = buildLocalIconPaths(MODEL_ICON_DIR, slug);
  const cdnName = MODEL_CDN_MAP[slug];
  if (cdnName) {
    sources.push(`${APPLE_CDN}/${cdnName}${APPLE_IMG_PARAMS}`);
  }
  if (dbUrl) sources.push(dbUrl);
  return sources;
}
