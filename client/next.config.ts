import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // webpack: (config) => {
  //   config.resolve.fallback = {
  //     ...config.resolve.fallback,
  //     fs: false, // Pyodide uses a virtual file system, not Node's fs
  //   };
  //   return config;
  // },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 🔴 FORCE wllama to use the compiled JS file, not the raw TS file
      '@wllama/wllama': '@wllama/wllama/esm/index.js',
    };
    return config;
  },
  // 2. ⚡ ENABLE MULTI-THREADING (SharedArrayBuffer)
  async headers() {
    return [
      {
        source: '/(.*)', // Apply to all routes
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
