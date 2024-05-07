import * as dotenv from 'dotenv';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import url from 'url';
// eslint-disable-next-line import/no-named-as-default
import webpack from 'webpack';

// Loads default vars from `.env.testnet` & `.env.mainnet` file in this directory.
// Reference package.json build script.
// TODO: add `.env.mainnet` when ready.
//       const envPath = process.env['NODE_ENV'] === 'mainnet' ? '.env.mainnet' : '.env.testnet';
//       dotenv.config({ path: envPath });
dotenv.config({ path: ['.env.local', '.env.testnet'] });

const keysPackage = path.dirname(url.fileURLToPath(import.meta.resolve('@penumbra-zone/keys')));

/*
 * The DefinePlugin replaces the specified values in the code during the build process.
 * - These are also declared in `prax.d.ts` for TypeScript compatibility.
 * - `process.env.NODE_ENV` and other environment variables are provided by the DefinePlugin.
 * - Since the plugin performs a direct text replacement, the values must be stringified.
 *   This is why `JSON.stringify()` is used, to ensure the values include quotes in the final output.
 */
const definitions = {
  CHAIN_ID: JSON.stringify(process.env['PRAX_CHAIN_ID']),
  PRAX: JSON.stringify(process.env['PRAX']),
  PRAX_ORIGIN: JSON.stringify(`chrome-extension://${process.env['PRAX']}`),
  IDB_VERSION: JSON.stringify(Number(process.env['PRAX_IDB_VERSION'])),
  MINIFRONT_URL: JSON.stringify(process.env['PRAX_MINIFRONT_URL']),
  EXTERNAL: JSON.stringify(JSON.parse(process.env['PRAX_EXTERNAL'] ?? 'false')),
};

const __dirname = new URL('.', import.meta.url).pathname;
const srcDir = path.join(__dirname, 'src');

const entryDir = path.join(srcDir, 'entry');

const config: webpack.Configuration = {
  entry: {
    'offscreen-handler': path.join(entryDir, 'offscreen-handler.ts'),
    'providers-handler': path.join(entryDir, 'providers-handler.ts'),
    'page-root': path.join(entryDir, 'page-root.tsx'),
    'popup-root': path.join(entryDir, 'popup-root.tsx'),
    'service-worker': path.join(srcDir, 'service-worker.ts'),
    'wasm-build-action': path.join(srcDir, 'wasm-build-action.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  optimization: {
    splitChunks: {
      chunks: chunk => {
        const filesNotToChunk = ['service-worker', 'wasm-build-action'];
        return chunk.name ? !filesNotToChunk.includes(chunk.name) : false;
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                ident: 'postcss',
                plugins: ['tailwindcss', 'autoprefixer'],
              },
            },
          },
        ],
      },
      {
        test: /\.mp4$/,
        type: 'asset/resource',
        generator: {
          filename: 'videos/[hash][ext][query]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@ui': path.resolve(__dirname, '../../packages/ui'),
    },
  },
  plugins: [
    new webpack.CleanPlugin(),
    new webpack.ProvidePlugin({
      // Required by the `bip39` library
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.IgnorePlugin({
      // Not required by the `bip39` library, but very nice
      checkResource(resource) {
        return /.*\/wordlists\/(?!english).*\.json/.test(resource);
      },
    }),
    new webpack.DefinePlugin(definitions),
    new CopyPlugin({
      patterns: [
        'public',
        {
          from: path.join(keysPackage, 'keys', '*_pk.bin'),
          to: 'keys/[name][ext]',
        },
      ],
    }),
    // html entry points
    new HtmlWebpackPlugin({
      favicon: 'public/favicon/icon128.png',
      title: 'Prax Wallet',
      template: 'react-root.html',
      filename: 'page.html',
      chunks: ['page-root'],
    }),
    new HtmlWebpackPlugin({
      title: 'Prax Wallet',
      template: 'react-root.html',
      rootId: 'popup-root',
      filename: 'popup.html',
      chunks: ['popup-root'],
    }),
    new HtmlWebpackPlugin({
      title: 'Penumbra Offscreen',
      filename: 'offscreen.html',
      chunks: ['offscreen-handler'],
    }),
    new HtmlWebpackPlugin({
      title: 'Providers Announcement',
      filename: 'providers.html',
      chunks: ['providers-handler'],
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
};

export default config;
