import type { NextConfig } from "next";

/** Flask backend — used by dev rewrites (server-side only). */
const hirehubApiUrl =
  process.env.HIREHUB_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:5000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${hirehubApiUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${hirehubApiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
