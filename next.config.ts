import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
