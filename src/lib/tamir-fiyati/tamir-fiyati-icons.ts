const BRAND_ICON_DIR = "/tamir-icons/brands";
const MODEL_ICON_DIR = "/tamir-icons/models";

const ICON_EXTENSIONS = [".png", ".webp", ".jpg", ".svg"] as const;

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
  if (dbUrl) sources.push(dbUrl);
  return sources;
}
