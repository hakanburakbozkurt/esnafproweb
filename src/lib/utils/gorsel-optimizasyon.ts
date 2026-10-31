/**
 * Vitrin görsellerinin Next/Vercel görsel optimizasyonundan geçip geçemeyeceğini belirler.
 * Yalnızca kendi Supabase depolamamızdaki herkese açık dosyalar optimize edilir;
 * başka bir adres (ör. toptancı XML'inden gelen dış görsel) düz <img> ile gösterilir.
 * next.config.ts içindeki remotePatterns ile aynı kuralı kullanır.
 */

const VARSAYILAN_SUPABASE_URL = "https://dysikgsgxpfxrclgvenh.supabase.co";

export const STORAGE_PUBLIC_PATH = "/storage/v1/object/public/";

export function supabaseGorselHostu(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || VARSAYILAN_SUPABASE_URL;
  try {
    return new URL(raw).hostname;
  } catch {
    return new URL(VARSAYILAN_SUPABASE_URL).hostname;
  }
}

export function optimizeEdilebilirGorsel(src: string | null | undefined): boolean {
  if (!src) return false;
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      url.hostname === supabaseGorselHostu() &&
      url.pathname.startsWith(STORAGE_PUBLIC_PATH)
    );
  } catch {
    return false;
  }
}
