import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.rframe.ru/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "https://api.rframe.ru/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;