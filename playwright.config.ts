import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: [
    {
      command: 'pnpm run --dir apps/webapp preview --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: true,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    // TODO: cargo run a testnet??
  ],
  use: {
    baseURL: 'http://localhost:4173/',
  },
});
