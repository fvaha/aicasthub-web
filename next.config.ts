import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/medusa/:path*",
        destination: "http://localhost:9009/:path*",
      },
    ];
  },
};

export default nextConfig;
