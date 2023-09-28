module.exports = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  const prodConfig = !isDev ? { output: 'export' } : {};

  return {
    ...prodConfig,
    reactStrictMode: true,
    transpilePackages: ['ui'],
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'avatar.vercel.sh',
        },
      ],
    },
    distDir: 'dist',

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
};
