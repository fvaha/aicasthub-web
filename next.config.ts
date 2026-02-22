import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/medusa/:path*",
        destination: "http://localhost:9000/:path*",
      },
    ];
  },
};

export default nextConfig;
