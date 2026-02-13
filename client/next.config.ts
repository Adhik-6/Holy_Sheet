import type { NextConfig } from "next";
console.log("🛠️ IS MOBILE BUILD?", process.env.MOBILE_BUILD);
const nextConfig: NextConfig = {
  output: process.env.MOBILE_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          // Notice: No ports! Just the raw Capacitor origins
          { key: "Access-Control-Allow-Origin", value: "http://localhost, capacitor://localhost" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ]
      }
    ]
  }
};

export default nextConfig;
