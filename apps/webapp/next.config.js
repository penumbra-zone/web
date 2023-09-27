module.exports = {
  reactStrictMode: true,
  transpilePackages: ['ui'],
  images: {
    domains: ['avatar.vercel.sh'],
  },
  distDir: 'dist',
  output: 'export',
  webpack: config => {
    config.module.rules.push({
      test: /\.mp4$/,
      type: 'asset/resource',
      generator: {
        filename: 'videos/[hash][ext][query]',
      },
    });

    return config;
  },
};
