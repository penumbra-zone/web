const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = path.join(__dirname, '..', 'src');
const webpack = require('webpack');

module.exports = {
  entry: {
    popup: path.join(srcDir, 'popup.tsx'),
    page: path.join(srcDir, 'page.tsx'),
    'service-worker': path.join(srcDir, 'service-worker.ts'),
  },
  output: {
    path: path.join(__dirname, '../dist/js'),
    filename: '[name].js',
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks(chunk) {
        return chunk.name !== 'service-worker';
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
