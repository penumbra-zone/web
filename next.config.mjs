/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config) => {
    config.experiments.asyncWebAssembly = true
    return config;
  },
};

export default nextConfig;