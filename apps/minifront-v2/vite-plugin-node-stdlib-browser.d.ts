/// <reference types="vite/client" />

declare module 'vite-plugin-node-stdlib-browser' {
  import type { Plugin } from 'vite';
  function polyfillNode(): Plugin;
  export default polyfillNode;
}
