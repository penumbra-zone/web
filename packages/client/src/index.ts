import { assertGlobalPresent, assertProvider, assertProviderManifest } from './assert.js';
import { isPenumbraManifest, type PenumbraManifest } from './manifest.js';
import type { PenumbraProvider } from './provider.js';
import { PenumbraSymbol } from './symbol.js';

declare global {
  interface Window {
    /** Records injected upon this global should identify themselves by a field
     * name matching the origin of the provider. */
    readonly [PenumbraSymbol]?: undefined | Readonly<Record<string, PenumbraProvider>>;
  }
}

/** Synchronously return the specified provider, without verifying anything. */
export const getPenumbraProviderUnsafe = (penumbraOrigin: string) =>
  window[PenumbraSymbol]?.[penumbraOrigin];

/** Return the specified provider after confirming presence of its manifest. */
export const getPenumbraProvider = (penumbraOrigin: string) => assertProvider(penumbraOrigin);

/** Return the specified provider's manifest. */
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

export const getAllPenumbraManifests = (): Record<
  keyof (typeof window)[typeof PenumbraSymbol],
  Promise<PenumbraManifest>
> =>
  Object.fromEntries(
    Object.keys(assertGlobalPresent()).map(providerOrigin => [
      providerOrigin,
      getPenumbraManifest(providerOrigin),
    ]),
  );

export type { PenumbraManifest } from './manifest.js';
export type { PenumbraProvider } from './provider.js';
export { PenumbraState } from './state.js';
export { PenumbraSymbol } from './symbol.js';
