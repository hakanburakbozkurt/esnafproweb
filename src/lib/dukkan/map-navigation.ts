export type MapLocation = {
  enlem: number | null;
  boylam: number | null;
  adres: string | null;
  label?: string;
};

export function hasMapLocation({ enlem, boylam, adres }: MapLocation): boolean {
  return (enlem != null && boylam != null) || Boolean(adres?.trim());
}

export function buildGoogleMapsSearchUrl({
  enlem,
  boylam,
  adres,
}: MapLocation): string | null {
  if (enlem != null && boylam != null) {
    return `https://www.google.com/maps/search/?api=1&query=${enlem},${boylam}`;
  }

  const trimmedAdres = adres?.trim();
  if (trimmedAdres) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedAdres)}`;
  }

  return null;
}

export function buildGoogleMapsDirectionsUrl({
  enlem,
  boylam,
  adres,
}: MapLocation): string | null {
  if (enlem != null && boylam != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${enlem},${boylam}`;
  }

  const trimmedAdres = adres?.trim();
  if (trimmedAdres) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trimmedAdres)}`;
  }

  return null;
}

export function buildGeoNavigationUrl({
  enlem,
  boylam,
  adres,
  label,
}: MapLocation): string | null {
  const destinationLabel = label?.trim() || adres?.trim() || "Konum";

  if (enlem != null && boylam != null) {
    return `geo:${enlem},${boylam}?q=${enlem},${boylam}(${encodeURIComponent(destinationLabel)})`;
  }

  const trimmedAdres = adres?.trim();
  if (trimmedAdres) {
    return `geo:0,0?q=${encodeURIComponent(trimmedAdres)}`;
  }

  return null;
}

export function buildAppleMapsUrl({
  enlem,
  boylam,
  adres,
  label,
}: MapLocation): string | null {
  const destinationLabel = label?.trim() || adres?.trim() || "Konum";

  if (enlem != null && boylam != null) {
    return `http://maps.apple.com/?ll=${enlem},${boylam}&q=${encodeURIComponent(destinationLabel)}`;
  }

  const trimmedAdres = adres?.trim();
  if (trimmedAdres) {
    return `http://maps.apple.com/?q=${encodeURIComponent(trimmedAdres)}`;
  }

  return null;
}

export function buildMapEmbedUrl({
  enlem,
  boylam,
  adres,
}: MapLocation): string | null {
  if (enlem != null && boylam != null) {
    return `https://www.google.com/maps?q=${enlem},${boylam}&z=17&output=embed`;
  }

  const trimmedAdres = adres?.trim();
  if (trimmedAdres) {
    return `https://www.google.com/maps?q=${encodeURIComponent(trimmedAdres)}&output=embed`;
  }

  return null;
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function openMapNavigation(location: MapLocation): void {
  const directionsUrl = buildGoogleMapsDirectionsUrl(location);
  if (!directionsUrl) return;

  if (isMobileDevice()) {
    const nativeUrl = isIosDevice()
      ? buildAppleMapsUrl(location)
      : buildGeoNavigationUrl(location);

    if (nativeUrl) {
      window.location.href = nativeUrl;
      return;
    }
  }

  window.open(directionsUrl, "_blank", "noopener,noreferrer");
}
