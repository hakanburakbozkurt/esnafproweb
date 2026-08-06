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
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  return "https://esnafpro.app";
}

export function getPasswordResetRedirectUrl(): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}/auth/callback?next=/yeni-sifre`;
}
