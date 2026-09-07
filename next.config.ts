import type { NextConfig } from "next";
const media = process.env.S3_PUBLIC_BASE_URL;
const config: NextConfig = {
  images: {
    dangerouslyAllowLocalIP:
      process.env.ALLOW_LOCAL_IMAGE_IP === "true" && !process.env.VERCEL,
    remotePatterns: media ? [new URL(`${media.replace(/\/$/, "")}/**`)] : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};
export default config;
