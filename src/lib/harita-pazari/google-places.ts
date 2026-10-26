import "server-only";
import type { HaritaKonum, HaritaPlace } from "@/lib/harita-pazari/rapor";

const PLACES_BASE_URL = "https://places.googleapis.com/v1";
export const RAKIP_ARAMA_YARICAPI_M = 5000;
const MAX_SONUC = 20;

const PLACE_FIELDS = [
  "id",
  "displayName",
  "rating",
  "userRatingCount",
  "primaryTypeDisplayName",
  "location",
  "googleMapsUri",
] as const;

export class GooglePlacesYapilandirmaHatasi extends Error {}

type ApiPlace = {
  id?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
  googleMapsUri?: string;
};

export function isGooglePlacesConfigured(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());
}

function apiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) {
    throw new GooglePlacesYapilandirmaHatasi("GOOGLE_PLACES_API_KEY tanımlı değil.");
  }
  return key;
}

function toPlace(raw: ApiPlace): HaritaPlace | null {
  if (!raw.id) return null;
  const lat = raw.location?.latitude;
  const lng = raw.location?.longitude;
  return {
    id: raw.id,
    ad: raw.displayName?.text?.trim() || "İsimsiz işletme",
    puan: typeof raw.rating === "number" ? raw.rating : null,
    yorumSayisi: typeof raw.userRatingCount === "number" ? raw.userRatingCount : null,
    kategori: raw.primaryTypeDisplayName?.text?.trim() || null,
    konum: typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null,
    haritaUrl: raw.googleMapsUri ?? null,
  };
}

async function placesRequest<T>(path: string, init: { method: "GET" | "POST"; fieldMask: string; body?: unknown }): Promise<T> {
  const response = await fetch(`${PLACES_BASE_URL}${path}`, {
    method: init.method,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": init.fieldMask,
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Google Places ${response.status}: ${detail}`);
  }
  return (await response.json()) as T;
}

const listFieldMask = PLACE_FIELDS.map((field) => `places.${field}`).join(",");

function circle(center: HaritaKonum, radius: number) {
  return { circle: { center: { latitude: center.lat, longitude: center.lng }, radius } };
}

/** 5 km içindeki telefon mağazaları, Google'ın öne çıkma (popülerlik) sırasıyla; en fazla 20. */
export async function yakindakiTelefoncular(konum: HaritaKonum): Promise<HaritaPlace[]> {
  const data = await placesRequest<{ places?: ApiPlace[] }>("/places:searchNearby", {
    method: "POST",
    fieldMask: listFieldMask,
    body: {
      includedTypes: ["cell_phone_store"],
      maxResultCount: MAX_SONUC,
      rankPreference: "POPULARITY",
      locationRestriction: circle(konum, RAKIP_ARAMA_YARICAPI_M),
      languageCode: "tr",
      regionCode: "TR",
    },
  });
  return (data.places ?? []).map(toPlace).filter((p): p is HaritaPlace => p !== null);
}

/** Mağaza adına göre yakın çevrede metin araması (kendi kaydını bulmak için). */
export async function isletmeAra(ad: string, konum: HaritaKonum): Promise<HaritaPlace[]> {
  const data = await placesRequest<{ places?: ApiPlace[] }>("/places:searchText", {
    method: "POST",
    fieldMask: listFieldMask,
    body: {
      textQuery: ad,
      maxResultCount: 5,
      locationBias: circle(konum, 1000),
      languageCode: "tr",
      regionCode: "TR",
    },
  });
  return (data.places ?? []).map(toPlace).filter((p): p is HaritaPlace => p !== null);
}

export async function isletmeDetayi(placeId: string): Promise<HaritaPlace | null> {
  const data = await placesRequest<ApiPlace>(
    `/places/${encodeURIComponent(placeId)}?languageCode=tr&regionCode=TR`,
    { method: "GET", fieldMask: PLACE_FIELDS.join(",") }
  );
  return toPlace(data);
}
