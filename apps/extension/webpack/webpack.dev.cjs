const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');
const webpack = require('webpack');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  mode: 'development',
  plugins: [
    // Our current webpack config wraps `service-worker.ts` in a function.
    // This makes registering top-level listeners render errors.
    // If someone figures this one out, move this to `service-worker.ts`.
    // Just for dev env so service worker hand-offs are immediate.
    new webpack.BannerPlugin({
      banner: `
           self.addEventListener('install', () => {
              self.skipWaiting();
           });

          self.addEventListener('activate', event => {
            event.waitUntil(self.clients.claim());
          });
      `,
      include: 'service-worker.js',
      raw: true,
    }),
  ],
});
