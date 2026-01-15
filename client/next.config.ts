import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // webpack: (config) => {
  //   config.resolve.fallback = {
  //     ...config.resolve.fallback,
  //     fs: false, // Pyodide uses a virtual file system, not Node's fs
  //   };
  //   return config;
  // },
};

export default nextConfig;
