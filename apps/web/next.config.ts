import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@supplychain/ui", "@supplychain/types"],
};

export default nextConfig;

