/** Supabase auth yönlendirmeleri için site kök URL */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

/** Sitemap, robots ve kanonik SEO URL'leri için üretim tabanı */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (raw) {
    return raw
      .replace(/\/$/, "")
      .replace(/^http:\/\//i, "https://")
      .replace(/^https:\/\/esnafpro\.app/i, "https://www.esnafpro.app");
  }

  return "https://www.esnafpro.app";
}

/** Şifre sıfırlama e-postasındaki bağlantı her zaman üretim alan adına gider */
export function getPasswordResetRedirectUrl(): string {
  const siteUrl = getPublicSiteUrl();
  return `${siteUrl}/auth/callback?next=/yeni-sifre`;
}
