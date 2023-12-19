const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const srcDir = path.join(__dirname, '..', 'src');

module.exports = {
  entry: {
    popup: path.join(srcDir, 'popup.tsx'),
    page: path.join(srcDir, 'page.tsx'),
    'service-worker': path.join(srcDir, 'service-worker.ts'),
    'injected-connection-manager': path.join(srcDir, 'injected-connection-manager.ts'),
    'injected-penumbra-global': path.join(srcDir, 'injected-penumbra-global.ts'),
    offscreen: path.join(srcDir, 'offscreen.ts'),
  },
  output: {
    path: path.join(__dirname, '../dist/js'),
    filename: '[name].js',
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks(chunk) {
        // These files cannot be chunked due to their runtime env
        return (
          chunk.name !== 'service-worker' &&
          chunk.name !== 'injected-connection-manager' &&
          chunk.name !== 'injected-penumbra-global'
        );
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
      '@ui': path.resolve(__dirname, '../../../packages/ui'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new CopyPlugin({
      patterns: [{ from: '.', to: '../', context: 'public' }],
      options: {},
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
};
