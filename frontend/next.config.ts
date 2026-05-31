import path from "path";
import type { NextConfig } from "next";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "";
const BACKEND_URL = INTERNAL_API_URL || "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  // Ekspos INTERNAL_API_URL ke server bundle secara eksplisit.
  // Tanpa ini, Next.js/webpack meng-inline nilainya saat build time sebagai undefined
  // jika var tidak tersedia selama proses build di Amplify.
  env: {
    INTERNAL_API_URL: INTERNAL_API_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/uploads/**",
      },
      ...(process.env.S3_BUCKET || process.env.AWS_S3_BUCKET
        ? [
            {
              protocol: "https" as const,
              hostname: `${process.env.S3_BUCKET || process.env.AWS_S3_BUCKET}.s3.${process.env.S3_REGION || process.env.AWS_REGION || "ap-southeast-3"}.amazonaws.com`,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
  outputFileTracingRoot: path.join(__dirname, ".."),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
