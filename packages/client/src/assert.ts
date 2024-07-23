import {
  PenumbraNotInstalledError,
  PenumbraProviderNotAvailableError,
  PenumbraProviderNotConnectedError,
} from './error.js';
import { PenumbraSymbol } from './symbol.js';

const assertStringIsOrigin = (s?: string) => {
  if (!s || new URL(s).origin !== s) {
    throw new TypeError('Invalid origin');
  }
  return s;
};

export const assertPenumbra = () => {
  if (!window[PenumbraSymbol]) {
    throw new PenumbraNotInstalledError();
  }
  return window[PenumbraSymbol];
};

/**
 * Given a specific origin, identify the relevant injection or throw.  An
 * `undefined` origin is accepted but will throw.
 *
 * This method does not confirm the manifest is present.
 */
export const assertProviderRecord = (providerOrigin?: string) => {
  const provider = assertPenumbra()[assertStringIsOrigin(providerOrigin)];
  if (!provider) {
    throw new PenumbraProviderNotAvailableError(providerOrigin);
  }
  return provider;
};

/**
 * Perform a complete check and return the specified provider. The global
 * exists, the manifest is present, and the provider is connected.
 */
export const assertProvider = (providerOrigin?: string) =>
  assertProviderManifest(providerOrigin).then(() => assertProviderConnected(providerOrigin));

/**
 * Given a specific origin, identify the relevant injection, and confirm
 * provider is connected or throw. An `undefined` origin is accepted but will
 * throw.
 *
 * This method does not confirm the manifest is present. It only asserts that
 * the specified provider claims it is connected.
 */
export const assertProviderConnected = (providerOrigin?: string) => {
  const provider = assertProviderRecord(providerOrigin);
  if (!provider.isConnected()) {
    throw new PenumbraProviderNotConnectedError(providerOrigin);
  }
  return provider;
};

/**
 * Given a specific origin, identify the relevant injection, and confirm its
 * manifest is actually present or throw.  An `undefined` origin is accepted but
 * will throw.
 *
 * The manifest will be fetched and returned as parsed json. The `signal`
 * parameter may be used to abort the fetch.
 */
export const assertProviderManifest = async (providerOrigin?: string, signal?: AbortSignal) => {
  // confirm the provider injection is present
  const provider = assertProviderRecord(providerOrigin);

  let manifest: unknown;

  try {
    // confirm the provider manifest is located at the expected origin
    if (new URL(provider.manifest).origin !== providerOrigin) {
      throw new Error('Manifest located at unexpected origin');
    }

    // confirm the provider manifest can be fetched, and is json
    const req = await fetch(provider.manifest, { signal });
    manifest = await req.json();

    if (!manifest) {
      throw new Error(`Cannot confirm ${providerOrigin} is real.`);
    }
  } catch (cause) {
    if (signal?.aborted !== true) {
      console.warn(cause);
      throw new PenumbraProviderNotAvailableError(providerOrigin, { cause });
    }
  }

  return manifest;
};
