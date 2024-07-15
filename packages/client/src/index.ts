import { assertGlobalPresent, assertProvider, assertProviderManifest } from './assert.js';
import { isPenumbraManifest, type PenumbraManifest } from './manifest.js';
import type { PenumbraProvider } from './provider.js';
import { PenumbraSymbol } from './symbol.js';

declare global {
  interface Window {
    /** Records injected upon this global should be identified by a name matching
     * the origin segment of their manifest href `PenumbraProvider['manifest']`. */
    readonly [PenumbraSymbol]?: undefined | Readonly<Record<string, PenumbraProvider>>;
  }
}

/** Return the specified provider, without verifying anything. */
export const getPenumbraUnsafe = (penumbraOrigin: string) =>
  window[PenumbraSymbol]?.[penumbraOrigin];

/** Return the specified provider after confirming presence of its manifest. */
export const getPenumbra = (penumbraOrigin: string) => assertProvider(penumbraOrigin);

/** Fetch the specified provider's manifest. */
export const getPenumbraManifest = async (
  penumbraOrigin: string,
  signal?: AbortSignal,
): Promise<PenumbraManifest> => {
  const manifestJson = await assertProviderManifest(penumbraOrigin, signal);
  if (!isPenumbraManifest(manifestJson)) {
    throw new TypeError('Invalid manifest');
  }
  return manifestJson;
};

/** Fetch all manifests for all providers available on the page. */
export const getAllPenumbraManifests = (signal?: AbortSignal) =>
  Object.fromEntries(
    Object.keys(assertGlobalPresent()).map(providerOrigin => [
      providerOrigin,
      getPenumbraManifest(providerOrigin, signal),
    ]),
  );

export * from './error.js';
export type { PenumbraManifest } from './manifest.js';
export type { PenumbraProvider } from './provider.js';
export { PenumbraState } from './state.js';
export { PenumbraSymbol } from './symbol.js';
