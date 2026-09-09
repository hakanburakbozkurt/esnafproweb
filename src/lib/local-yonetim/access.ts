export const LOCAL_YONETIM_PATH_PREFIX = "/local-yonetim";

export function isLocalDevelopmentHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");

  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1"
  ) {
    return true;
  }

  if (host.endsWith(".local") || host.endsWith(".localhost")) {
    return true;
  }

  return false;
}

/** Yerel komuta merkezi yalnızca dev ortamında veya localhost'ta açılır. */
export function isLocalYonetimAccessAllowed(hostname: string): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return isLocalDevelopmentHost(hostname);
}
