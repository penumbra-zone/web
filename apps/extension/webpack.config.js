import dotenv from 'dotenv';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

// Loads default vars from `.env` file in this directory.  If you set
// environment variables, you will override those defaults.
dotenv.config();

const definitions = {
  // process.env.NODE_ENV is automatically provided by DefinePlugin

  PRAX: JSON.stringify(process.env.PRAX),
  PRAX_ORIGIN: JSON.stringify(`chrome-extension://${process.env.PRAX}`),

  IDB_VERSION: JSON.stringify(Number(process.env.IDB_VERSION)),
  USDC_ASSET_ID: JSON.stringify(process.env.USDC_ASSET_ID),

  MINIFRONT_URL: JSON.stringify(process.env.MINIFRONT_URL),

  // you may want https://grpc.testnet-preview.penumbra.zone/
  DEFAULT_GRPC_URL: JSON.stringify(process.env.PENUMBRA_NODE_PD_URL),
};

const __dirname = new URL('.', import.meta.url).pathname;
const srcDir = path.join(__dirname, 'src');
const entryDir = path.join(srcDir, 'entry');
const contentScripts = path.join(entryDir, 'content-script');
const pageScripts = path.join(entryDir, 'page');

export default (env, argv) => {
  return {
    entry: {
      'injected-connection-port': path.join(contentScripts, 'injected-connection-port.ts'),
      'injected-penumbra-global': path.join(contentScripts, 'injected-penumbra-global.ts'),
      'injected-request-listener': path.join(contentScripts, 'injected-request-listener.ts'),

      'init-listeners': path.join(entryDir, 'init-listeners.ts'),
      'penumbra-rpc': path.join(entryDir, 'penumbra-rpc.ts'),

      'onboarding-root': path.join(pageScripts, 'onboarding-root.tsx'),
      'popup-root': path.join(pageScripts, 'popup-root.tsx'),
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

            'init-listeners',
            'penumbra-rpc',
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
        patterns: ['public', { from: 'bin', to: 'bin' }],
      }),
      // html entry points
      new HtmlWebpackPlugin({
        favicon: 'public/icon.png',
        title: 'Prax Welcome',
        template: 'react-root.html',
        filename: 'onboarding.html',
        chunks: ['onboarding-root'],
      }),
      new HtmlWebpackPlugin({
        title: 'Prax Wallet',
        template: 'react-root.html',
        rootId: 'popup-root',
        filename: 'popup.html',
        chunks: ['popup-root'],
      }),
      new HtmlWebpackPlugin({
        title: 'Prax Offscreen',
        filename: 'penumbra-rpc.html',
        chunks: ['penumbra-rpc'],
      }),
    ],
    experiments: {
      asyncWebAssembly: true,
    },
  };
};
