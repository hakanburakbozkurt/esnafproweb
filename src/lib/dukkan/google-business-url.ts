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
