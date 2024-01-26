import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import webpack from 'webpack';

export default merge(common, {
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
