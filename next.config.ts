import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the preview iframe to be served from the same origin
  async headers() {
    return [
      {
        source: "/api/pages/:pageId/preview",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
