import { assertPenumbra, assertProviderManifest, assertProviderRecord } from './assert.js';
import { PenumbraManifest, PenumbraManifestJson, isPenumbraManifestJson } from './manifest.js';
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
  if (!isPenumbraManifestJson(manifestJson)) {
    throw new TypeError('Invalid manifest');
  }
  const icons = await getManifestIcons(penumbraOrigin, manifestJson, signal);
  return {
    ...manifestJson,
    icons,
  };
};

/** Fetch all manifests for all providers available on the page. */
export const getPenumbraManifests = (
  signal?: AbortSignal,
): Record<string, Promise<PenumbraManifest>> =>
  Object.fromEntries(
    Object.keys(getPenumbraGlobal()).map(providerOrigin => [
      providerOrigin,
      getPenumbraManifest(providerOrigin, signal),
    ]),
  );

// For use by `getPenumbraManifest`
const getManifestIcons = async (
  base: string,
  mf: PenumbraManifestJson,
  signal?: AbortSignal,
): Promise<PenumbraManifest['icons']> => {
  const getIcons = await Promise.all(
    Object.entries(mf.icons).map(async ([iconSize, iconPath]) => {
      if (typeof iconPath !== 'string') {
        throw new TypeError('Icon path is not a string');
      }
      if (Number.isNaN(Number(iconSize))) {
        throw new TypeError('Icon size is not a numeric string');
      }

      const res = await fetch(new URL(iconPath, base), { signal });
      return [`${Number(iconSize)}`, await res.blob()] as const;
    }),
  );

  return Object.fromEntries(getIcons);
};
