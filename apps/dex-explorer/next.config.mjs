/** @type {import('next').NextConfig} */
import url from 'node:url';
import { spawn } from 'node:child_process';
import rootPackageJson from './package.json' with { type: 'json' };
import WatchExternalFilesPlugin from 'webpack-watch-external-files-plugin';

/**
 * This custom plugin will run `pnpm install` before each watch-mode build. This
 * combined with WatchExternalFilesPlugin will ensure that tarball dependencies
 * are updated when they change.
 *
 * Copied and adapted from the Prax repo:
 * https://github.com/prax-wallet/prax/blob/main/apps/extension/webpack.config.ts#L86
 */
const PnpmInstallPlugin = {
  apply: ({ hooks }) =>
    hooks.watchRun.tapPromise(
      { name: 'CustomPnpmInstallPlugin' },
      compiler =>
        new Promise((resolve, reject) => {
          const pnpmInstall = spawn('pnpm', ['install', '--ignore-scripts'], { stdio: 'inherit' });
          pnpmInstall.on('exit', code => {
            if (code) {
              reject(new Error(`pnpm install failed ${code}`));
            } else {
              // clear webpack's cache to ensure new deps are used
              compiler.purgeInputFileSystem();
              resolve();
            }
          });
        }),
    ),
};

const nextConfig = {
  transpilePackages: ['@penumbra-zone/protobuf'],
  compiler: {
    styledComponents: true,
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
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

    const isWatching = process.env.WEBPACK_WATCH === 'true';

    if (isWatching) {
      const localPackages = [
        ...Object.values(rootPackageJson.dependencies),
        ...Object.values(rootPackageJson.devDependencies),
        ...Object.values(rootPackageJson.pnpm?.overrides ?? {}),
      ]
        .filter(specifier => specifier.endsWith('.tgz'))
        .map(tgzSpecifier =>
          tgzSpecifier.startsWith('file:') ? url.fileURLToPath(tgzSpecifier) : tgzSpecifier,
        );

      config.plugins.push(new WatchExternalFilesPlugin({ files: localPackages }));
      config.plugins.push(PnpmInstallPlugin);
    }

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
  // Disabling HMR in local dev requires NextJS >= v15.x, so disabling for now.
  // experimental: {
  //   // Don't cache the HMR in local dev.
  //   serverComponentsHmrCache: false,
  // },
};

export default nextConfig;
