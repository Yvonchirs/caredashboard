import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "32mb" },
  },
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${apiUrl}/uploads/:path*` }];
  },
};

export default nextConfig;
