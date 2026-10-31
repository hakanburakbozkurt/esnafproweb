import type { NextConfig } from "next";
import { STORAGE_PUBLIC_PATH, supabaseGorselHostu } from "./src/lib/utils/gorsel-optimizasyon";

const nextConfig: NextConfig = {
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
