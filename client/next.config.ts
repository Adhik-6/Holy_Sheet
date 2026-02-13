import type { NextConfig } from "next";
console.log("🛠️ IS MOBILE BUILD?", process.env.MOBILE_BUILD);
const nextConfig: NextConfig = {
  output: process.env.MOBILE_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
