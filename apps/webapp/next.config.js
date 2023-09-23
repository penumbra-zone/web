module.exports = {
  reactStrictMode: true,
  transpilePackages: ['ui'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4)$/,
      type: 'asset',
      generator: {
        filename: 'static/chunks/[path][name].[hash][ext]',
      },
    });

    return config;
  },
};
