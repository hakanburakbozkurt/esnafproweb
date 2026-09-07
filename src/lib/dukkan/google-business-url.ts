const ALLOWED_GOOGLE_MAPS_HOSTS = [
  "maps.google.com",
  "www.google.com",
  "google.com",
  "maps.app.goo.gl",
  "goo.gl",
  "g.page",
  "business.google.com",
] as const;

function isAllowedGoogleMapsHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ALLOWED_GOOGLE_MAPS_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

function isGoogleMapsPath(pathname: string, hostname: string): boolean {
  const path = pathname.toLowerCase();
  const host = hostname.toLowerCase();

  if (host.includes("goo.gl") || host === "g.page" || host.endsWith(".g.page")) {
    return true;
  }

  if (host.includes("business.google.com")) {
    return true;
  }

  return (
    path.startsWith("/maps") ||
    path.includes("/maps/") ||
    path.startsWith("/place") ||
    path.includes("maps.google")
  );
}

/** Google Haritalar / İşletme paylaşım linkini normalize eder */
export function normalizeGoogleBusinessUrl(
  input: string | null | undefined
): string | null {
  const trimmed = input?.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    if (!isAllowedGoogleMapsHost(parsed.hostname)) {
      return null;
    }

    if (!isGoogleMapsPath(parsed.pathname, parsed.hostname)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function validateGoogleBusinessUrlInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (!normalizeGoogleBusinessUrl(trimmed)) {
    return "Geçerli bir Google Haritalar veya Google İşletme paylaşım linki girin.";
  }

  return null;
}

export function hasGoogleBusinessUrl(
  url: string | null | undefined
): url is string {
  return Boolean(normalizeGoogleBusinessUrl(url));
}

type GoogleBusinessEmbedInput = {
  googleBusinessUrl?: string | null;
  googlePlaceId?: string | null;
  apiKey?: string | null;
};

function extractPlaceQueryFromGoogleMapsUrl(url: URL): string | null {
  const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/i);
  if (placeMatch?.[1]) {
    const placeName = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ").trim();
    if (placeName) return placeName;
  }

  const query =
    url.searchParams.get("q") ??
    url.searchParams.get("query") ??
    url.searchParams.get("destination");

  return query?.trim() || null;
}

/**
 * Google işletme kaydı için iframe URL'si üretir.
 *
 * Öncelik:
 * 1. Ayarlara doğrudan yapıştırılmış resmi /maps/embed URL'si
 * 2. Place ID + Maps Embed API anahtarı
 * 3. Uzun /maps/place/... URL'sindeki işletme adı
 *
 * Kısa maps.app.goo.gl linkleri tarayıcıda güvenilir şekilde çözümlenemediği
 * için null döner; harita bileşeni koordinat/adres fallback'ini kullanır.
 */
export function buildGoogleBusinessEmbedUrl({
  googleBusinessUrl,
  googlePlaceId,
  apiKey,
}: GoogleBusinessEmbedInput): string | null {
  const placeId = googlePlaceId?.trim();
  const embedApiKey = apiKey?.trim();

  if (placeId && embedApiKey) {
    const params = new URLSearchParams({
      key: embedApiKey,
      q: `place_id:${placeId}`,
    });
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
  }

  const normalizedUrl = normalizeGoogleBusinessUrl(googleBusinessUrl);
  if (!normalizedUrl) return null;

  try {
    const parsed = new URL(normalizedUrl);
    const host = parsed.hostname.toLowerCase();
    const isGoogleHost =
      host === "google.com" ||
      host === "www.google.com" ||
      host === "maps.google.com" ||
      host.endsWith(".google.com");

    if (isGoogleHost && parsed.pathname.toLowerCase().startsWith("/maps/embed")) {
      parsed.protocol = "https:";
      return parsed.toString();
    }

    if (!isGoogleHost) return null;

    const placeQuery = extractPlaceQueryFromGoogleMapsUrl(parsed);
    if (!placeQuery) return null;

    const params = new URLSearchParams({
      q: placeQuery,
      output: "embed",
    });
    return `https://www.google.com/maps?${params.toString()}`;
  } catch {
    return null;
  }
}
