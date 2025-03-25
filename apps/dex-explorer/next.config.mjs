const nextConfig = {
  webpack: config => {
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
    fetches: {
      // Display URLs for external targets of fetch requests
      fullUrl: true,
      // Also display URLs even when a cache is hit for the hot-module-reloading in dev.
      hmrRefreshes: true,
    },
  },
  // Disabling HMR in local dev requires NextJS >= v15.x, so disabling for now.
  // experimental: {
  //   // Don't cache the HMR in local dev.
  //   serverComponentsHmrCache: false,
  // },
};

export default nextConfig;
