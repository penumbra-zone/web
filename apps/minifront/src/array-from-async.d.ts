/** Needed for test environment */
declare module 'array-from-async' {
  import ArrayWithAsync from '@penumbra-zone/polyfills/Array.fromAsync';
  const fromAsync: (typeof ArrayWithAsync)['fromAsync'];
  export = fromAsync;
}
