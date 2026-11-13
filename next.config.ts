import type { NextConfig } from "next";
import { STORAGE_PUBLIC_PATH, supabaseGorselHostu } from "./src/lib/utils/gorsel-optimizasyon";

const nextConfig: NextConfig = {
  // "X-Powered-By: Next.js" başlığı gereksiz; yanıtlardan çıkarılır.
  poweredByHeader: false,
  // Paylaşım görselinin fontları ve ekran görüntüsü sunucu paketine dahil edilsin.
  outputFileTracingIncludes: {
    "/api/og": ["./src/assets/og/**"],
  },
  images: {
    // Yalnızca kendi Supabase depolamamızdaki herkese açık görseller optimize edilir.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseGorselHostu(),
        pathname: `${STORAGE_PUBLIC_PATH}**`,
      },
    ],
    // Vercel kotası: tek format, tek kalite ve az boyut = daha az dönüştürme.
    formats: ["image/webp"],
    qualities: [75],
    deviceSizes: [640, 828, 1200],
    imageSizes: [64, 128, 256, 384],
    // Dosya adları benzersiz (zaman damgası + rastgele ek), içerik değişmez: 31 gün önbellek.
    minimumCacheTTL: 2678400,
  },
  // Güvenlik başlıkları. CSP bilinçli olarak eklenmedi: harita, ödeme ve görsel
  // kaynaklarını kırabilir; ayrı ve test edilmiş bir adımda eklenecek.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/sitemap",
      },
      {
        source: "/llms.txt",
        destination: "/llms",
      },
      {
        source: "/:slug/llms.txt",
        destination: "/:slug/llms",
      },
    ];
  },
};

export default nextConfig;
