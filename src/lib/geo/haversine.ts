export type GeoCoordinates = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

/** İki koordinat arasındaki kuş uçuşu mesafe (km) */
export function haversineDistanceKm(
  from: GeoCoordinates,
  to: GeoCoordinates
): number {
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);

  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/** Rozet için okunabilir mesafe metni */
export function formatDistanceLabel(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "";

  if (km < 1) {
    const meters = Math.max(50, Math.round(km * 1000 / 50) * 50);
    return `${meters} m`;
  }

  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }

  return `${Math.round(km)} km`;
}

export function hasValidCoordinates(
  enlem: number | null | undefined,
  boylam: number | null | undefined
): enlem is number {
  return (
    enlem != null &&
    boylam != null &&
    Number.isFinite(enlem) &&
    Number.isFinite(boylam)
  );
}
