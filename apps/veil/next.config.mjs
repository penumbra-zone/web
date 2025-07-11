import bundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pino-pretty'],
  experimental: {
    optimizePackageImports: ['@penumbra-zone/ui', 'chain-registry', 'osmo-query', 'cosmos-kit'],
    serverComponentsHmrCache: true,
  },
  turbopack: {
    resolveAlias: {
      '@amplitude/analytics-browser': '@repo/stubs/amplitude-analytics-browser',
    },
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: config => {
    config.externals.push('pino-pretty');

    config.resolve.alias['@amplitude/analytics-browser'] =
      '@repo/stubs/amplitude-analytics-browser';

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: false,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });

    config.experiments.asyncWebAssembly = true;

    return config;
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    incomingRequests: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/cosmos/chain-registry/master/**',
        search: '',
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
