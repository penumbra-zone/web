/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@penumbra-zone/protobuf"],
  webpack: (config) => {
    config.experiments.asyncWebAssembly = true;
    return config;
  },
  output: "standalone",
};

export default nextConfig;