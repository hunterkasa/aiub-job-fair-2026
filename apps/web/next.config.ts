import type { NextConfig } from "next";

const apiBackendUrl = process.env.API_INTERNAL_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBackendUrl}/api/:path*`,
      },
      {
        source: "/health/:path*",
        destination: `${apiBackendUrl}/health/:path*`,
      },
    ];
  },
};

export default nextConfig;
