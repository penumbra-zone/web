import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

const PRAX = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

const IDB_VERSION = 23;
const USDC_ASSET_ID = 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=';

const MINIFRONT_URL = 'https://app.testnet.penumbra.zone/';
const PENUMBRA_NODE_PD_URL = 'https://grpc.testnet.penumbra.zone/';

const __dirname = new URL('.', import.meta.url).pathname;
const srcDir = path.join(__dirname, 'src');

export default (env, argv) => {
  // types declared in prax.d.ts
  const definitions = {
    // process.env.NODE_ENV is automatically provided by DefinePlugin

    PRAX: JSON.stringify(PRAX),
    PRAX_ORIGIN: JSON.stringify(`chrome-extension://${PRAX}`),

    IDB_VERSION: JSON.stringify(IDB_VERSION),
    USDC_ASSET_ID: JSON.stringify(USDC_ASSET_ID),

    MINIFRONT_URL: JSON.stringify(
      (argv.mode == 'development' && process.env.MINIFRONT_URL) || MINIFRONT_URL,
    ),

    DEFAULT_GRPC_URL: JSON.stringify(
      // you may want https://grpc.testnet-preview.penumbra.zone/
      (argv.mode == 'development' && process.env.PENUMBRA_NODE_PD_URL) || PENUMBRA_NODE_PD_URL,
    ),
  };

  console.log('webpack', { argv, definitions });

  return {
    entry: {
      offscreen: path.join(srcDir, 'offscreen.ts'),
      page: path.join(srcDir, 'page.tsx'),
      popup: path.join(srcDir, 'popup.tsx'),
      'injected-connection-manager': path.join(srcDir, 'injected-connection-manager.ts'),
      'injected-penumbra-global': path.join(srcDir, 'injected-penumbra-global.ts'),
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
            'injected-connection-manager',
            'injected-penumbra-global',
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
        patterns: ['public', { from: 'bin', to: 'bin', transform: { cache: true } }],
      }),
      // html entry points
      new HtmlWebpackPlugin({
        favicon: 'public/icon.png',
        title: 'Penumbra Wallet',
        template: 'react-root.html',
        filename: 'page.html',
        chunks: ['page'],
      }),
      new HtmlWebpackPlugin({
        title: 'Penumbra Wallet',
        template: 'react-root.html',
        rootId: 'popup-root',
        filename: 'popup.html',
        chunks: ['popup'],
      }),
      new HtmlWebpackPlugin({
        favicon: 'public/icon.png',
        title: 'Penumbra Offscreen',
        filename: 'offscreen.html',
        chunks: ['offscreen'],
      }),
    ],
    experiments: {
      asyncWebAssembly: true,
    },
  };
};
