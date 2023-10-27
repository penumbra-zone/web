module.exports = () => {
  const isProd = process.env.NODE_ENV === 'production';

  /**
   * @type {import('next').NextConfig}
   */
  const nextJsConfig = {
    output: isProd ? 'export' : undefined,
    // set reactStrictMode only for production
    reactStrictMode: isProd,
    transpilePackages: ['@penumbra-zone/ui'],
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
