module.exports = {
  reactStrictMode: true,
  transpilePackages: ['ui'],
  images: {
    domains: ['avatar.vercel.sh'],
  },
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
