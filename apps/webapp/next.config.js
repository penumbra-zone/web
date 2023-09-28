module.exports = () => {
  const isProd = process.env.NODE_ENV === 'production';

  /**
   * @type {import('next').NextConfig}
   */
  const nextJsConfig = {
    output: isProd ? 'export' : undefined,
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

  return nextJsConfig;
};
