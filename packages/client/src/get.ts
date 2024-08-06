import { assertPenumbra, assertProviderManifest, assertProviderRecord } from './assert.js';
import { PenumbraManifest, isPenumbraManifest } from './manifest.js';
import type { PenumbraProvider } from './provider.js';
import { PenumbraSymbol } from './symbol.js';

import './global.js';

/** Return the Penumbra global, without verifying anything. */
export const getPenumbraGlobalUnsafe = () => window[PenumbraSymbol];

/** Return the penumbra global, throwing `PenumbraNotInstalledError` if it's not available. */
export const getPenumbraGlobal = () => assertPenumbra();

/** Return the specified provider, without verifying anything. */
export const getPenumbraUnsafe = (penumbraOrigin: string) =>
  getPenumbraGlobalUnsafe()?.[penumbraOrigin];

/** Return the specified provider after confirming presence of its manifest. */
export const getPenumbra = async (penumbraOrigin: string): Promise<PenumbraProvider> => {
  const provider = assertProviderRecord(penumbraOrigin);
  await assertProviderManifest(penumbraOrigin);
  return provider;
};

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
export const getAllPenumbraManifests = (
  signal?: AbortSignal,
): Record<string, Promise<PenumbraManifest>> =>
  Object.fromEntries(
    Object.keys(getPenumbraGlobal()).map(providerOrigin => [
      providerOrigin,
      getPenumbraManifest(providerOrigin, signal),
    ]),
  );

/**
 * Asynchronously get a connection to the specified provider.
 *
 * Confirms presence of the provider's manifest.  Will attempt to request
 * approval if connection is not already active.
 *
 * @param requireProvider string identifying a provider origin
 */
export const getPenumbraPort = async (penumbraOrigin: string): Promise<MessagePort> => {
  const provider = assertProviderRecord(penumbraOrigin);
  await assertProviderManifest(penumbraOrigin);
  return provider.connect();
};
