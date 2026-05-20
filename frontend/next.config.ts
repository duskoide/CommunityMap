import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {},
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
