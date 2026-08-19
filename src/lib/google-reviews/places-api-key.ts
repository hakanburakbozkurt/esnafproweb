/**
 * Places Details / yorum fetch — yalnızca sunucu tarafında kullanılır.
 * Öncelik: GOOGLE_PLACES_API_KEY (önerilen, gizli)
 * Yedek: NEXT_PUBLIC_GOOGLE_PLACES_API_KEY (Vercel'de tanımlıysa sunucuda okunur)
 */
export function getGooglePlacesApiKey(): string | null {
  return (
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim() ||
    null
  );
}

export function isGooglePlacesApiConfigured(): boolean {
  return Boolean(getGooglePlacesApiKey());
}
