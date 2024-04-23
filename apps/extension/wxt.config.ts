import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

export default defineConfig({
  entrypointsDir: 'entry',
  srcDir: 'src',
  publicDir: 'public',
  vite: () => ({
    plugins: [react(), wasm(), topLevelAwait()],
  }),
  manifestVersion: 3,

  experimental: {
    includeBrowserPolyfill: false,
  },
  manifest: {
    name: 'Prax wallet',
    version: '6.3.0',
    description: 'For use in interacting with the Penumbra blockchain',
    // @ts-expect-error - https://github.com/wxt-dev/wxt/issues/521#issuecomment-1985674631
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvnucOJi878TGZYnTNTrvXd9krAcpSDR/EgHcQhvjNZrKfRRsKA9O0DnbyM492c3hiicYPevRPLPoKsLgVghGDYPr8eNO7ee165keD5XLxq0wpWu14gHEPdQSRNZPLeawLp4s/rUwtzMcxhVIUYYaa2xZri4Tqx9wpR7YR1mQTAL8UsdjyitrnzTM20ciKXq1pd82MU74YaZzrcQCOmcjJtjHFdMEAYme+LuZuEugAgef9RiE/8kLQ6T7W9feYfQOky1OPjBkflpRXRgW6cACdl+MeYhKJCOHijglFsPOXX6AvnoJSeAJYRXOMVJi0ejLKEcrLpaeHgh+1WXUvc5G4wIDAQAB',
    web_accessible_resources: [
      {
        resources: ['manifest.json'],
        matches: ['<all_urls>'],
      },
    ],
    permissions: ['storage', 'unlimitedStorage', 'offscreen'],
    host_permissions: ['<all_urls>'],
    content_security_policy: {
      extension_pages: "object-src 'self'; script-src 'self' 'wasm-unsafe-eval'",
    },
  },
});
