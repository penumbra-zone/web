import dotenv from 'dotenv';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import url from 'url';

// Loads default vars from `.env` file in this directory.  If you set
// environment variables, you will override those defaults.
dotenv.config();

const keysPackage = path.dirname(url.fileURLToPath(import.meta.resolve('@penumbra-zone/keys')));

// types declared in prax.d.ts
const definitions = {
  // process.env.NODE_ENV is automatically provided by DefinePlugin

  // Note that because the plugin does a direct text replacement,
  // the value given to it must include actual quotes inside of the string itself,
  // Hence the JSON.stringify() usage here
  CHAIN_ID: JSON.stringify(process.env.CHAIN_ID),
  PRAX: JSON.stringify(process.env.PRAX),
  PRAX_ORIGIN: JSON.stringify(`chrome-extension://${process.env.PRAX}`),
  IDB_VERSION: JSON.stringify(Number(process.env.IDB_VERSION)),
  MINIFRONT_URL: JSON.stringify(process.env.MINIFRONT_URL),
};

const __dirname = new URL('.', import.meta.url).pathname;
const srcDir = path.join(__dirname, 'src');

const entryDir = path.join(srcDir, 'entry');
const injectDir = path.join(srcDir, 'content-scripts');

export default (env, argv) => {
  return {
    entry: {
      'injected-connection-port': path.join(injectDir, 'injected-connection-port.ts'),
      'injected-penumbra-global': path.join(injectDir, 'injected-penumbra-global.ts'),
      'injected-request-listener': path.join(injectDir, 'injected-request-listener.ts'),
      'offscreen-handler': path.join(entryDir, 'offscreen-handler.ts'),
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
        chunks: chunk =>
          ![
            'injected-connection-port',
            'injected-penumbra-global',
            'injected-request-listner',
            'service-worker',
            'wasm-build-action',
          ].includes(chunk.name),
      },
    },
    module: {
      rules: [
        { test: /\.wasm/ },
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
        favicon: 'public/icon.png',
        title: 'Penumbra Wallet',
        template: 'react-root.html',
        filename: 'page.html',
        chunks: ['page-root'],
      }),
      new HtmlWebpackPlugin({
        title: 'Penumbra Wallet',
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
    ],
    experiments: {
      asyncWebAssembly: true,
    },
  };
};
