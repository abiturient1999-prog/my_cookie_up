import path from "path";
import type { NextConfig } from "next";

const asyncStorageShim = path.resolve(__dirname, "lib/async-storage-shim.ts");

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": asyncStorageShim,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": asyncStorageShim,
    };

    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
