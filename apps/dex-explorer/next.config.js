//import WasmPackPlugin from '@wasm-tool/wasm-pack-plugin';

const nextConfig = {
  webpack: (config) => {
    // config.module.rules.push({
    //   test: /\.(ts)x?$/, // Just `tsx?` file only
    //   use: [
    //     // options.defaultLoaders.babel, I don't think it's necessary to have this loader too
    //     {
    //       loader: "ts-loader",
    //       options: {
    //         transpileOnly: true,
    //         //experimentalWatchApi: true,
    //         //onlyCompileBundledFiles: true,
    //       },
    //     },
    //   ],
    // });

    // config.module.rules.push({
    //   test: /.wasm$/,
    //   use:  [
    //     {
    //       loader: "wasm-loader"
    //     }
    //   ],
    // })
    config.experiments = {
      ...(config.experiments ?? {}),
      asyncWebAssembly: true,
    };
    // config.plugins.push(
    //   new WasmPackPlugin({
    //     // separate Rust/NPM directories
    //     crateDirectory: path.resolve(__dirname, '../rust'),
    //   })
    // );
    //config.target = 'node18';
    return config;
  },
  // Support emitting a fully built docroot, via nextjs,
  // for serving via `node server.js`. See docs at pick
  // https://nextjs.org/docs/pages/building-your-application/deploying#docker-image
  output: 'standalone',
  // https://stackoverflow.com/questions/64989575/how-to-load-libraries-which-export-typescript-in-next-js
  // experimental: {
  //   optimizePackageImports: ['@penumbra-zone/wasm']
  // }
}

module.exports = nextConfig;