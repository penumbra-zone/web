/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ['@penumbra-zone/protobuf'],
  webpack: (config) => {
    config.experiments.asyncWebAssembly = true
    return config;
  },
};

export default nextConfig;