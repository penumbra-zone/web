import { createPromiseClient, type Transport } from '@connectrpc/connect';
import type { PenumbraService } from '@penumbra-zone/protobuf';
import { jsonOptions } from '@penumbra-zone/protobuf';
import {
  createChannelTransport,
  type ChannelTransportOptions,
} from '@penumbra-zone/transport-dom/create';
import {
  PenumbraProviderNotAvailableError,
  PenumbraProviderNotConnectedError,
  PenumbraProviderNotInstalledError,
} from './error';
import { PenumbraSymbol, type PenumbraInjection } from '.';

// Naively return the first available provider origin, or `undefined`.
const availableOrigin = () => Object.keys(window[PenumbraSymbol] ?? {})[0];

/**
 * Given a specific origin, identify the relevant injection or throw.  An
 * `undefined` origin is accepted but will throw.
 */
export const assertProvider = (providerOrigin?: string): PenumbraInjection => {
  const provider = providerOrigin && window[PenumbraSymbol]?.[providerOrigin];
  if (!provider) throw new PenumbraProviderNotAvailableError(providerOrigin);
  return provider;
};

/**
 * Given a specific origin, identify the relevant injection, and confirm
 * provider is connected or throw. An `undefined` origin is accepted but will
 * throw.
 */
export const assertProviderConnected = (providerOrigin?: string) => {
  const provider = assertProvider(providerOrigin);
  if (!provider.isConnected()) throw new PenumbraProviderNotConnectedError(providerOrigin);
  return provider;
};

/**
 * Given a specific origin, identify the relevant injection, and confirm its
 * manifest is actually present or throw.  An `undefined` origin is accepted but
 * will throw.
 */
export const assertProviderManifest = async (
  providerOrigin?: string,
): Promise<PenumbraInjection> => {
  // confirm the provider injection is present
  const provider = assertProvider(providerOrigin);

  try {
    // confirm the provider manifest is located at the expected origin
    if (new URL(provider.manifest).origin !== providerOrigin)
      throw new Error('Manifest located at unexpected origin');

    // confirm the provider manifest can be fetched, and is json
    const req = await fetch(provider.manifest);
    const manifest: unknown = await req.json();

    if (!manifest) throw new Error('Empty manifest');
  } catch (e) {
    console.warn(e);
    throw new PenumbraProviderNotInstalledError(providerOrigin);
  }

  return provider;
};

/**
 * Asynchronously get a connection to the specified provider, or the first
 * available provider if unspecified.
 *
 * Confirms presence of the provider's manifest.  Will attempt to request
 * approval if connection is not already active.
 *
 * @param requireProvider optional string identifying a provider origin
 */
export const getPenumbraPort = async (requireProvider?: string) => {
  const provider = await assertProviderManifest(requireProvider ?? availableOrigin());
  if (provider.isConnected() === undefined) await provider.request();
  return provider.connect();
};

/**
 * Synchronously create a channel transport for the specified provider, or the
 * first available provider if unspecified.
 *
 * Will always succeed, but the transport may fail if the provider is not
 * present, or if the provider rejects the connection.
 *
 * Confirms presence of the provider's manifest.  Will attempt to request
 * approval if connection is not already active.
 *
 * @param requireProvider optional string identifying a provider origin
 * @param transportOptions optional `ChannelTransportOptions` without `getPort`
 */
export const syncCreatePenumbraChannelTransport = (
  requireProvider?: string,
  transportOptions: Omit<ChannelTransportOptions, 'getPort'> = { jsonOptions },
): Transport =>
  createChannelTransport({
    ...transportOptions,
    getPort: () => getPenumbraPort(requireProvider),
  });

/**
 * Asynchronously create a channel transport for the specified provider, or the
 * first available provider if unspecified.
 *
 * Like `syncCreatePenumbraChannelTransport`, but awaits connection init.
 */
export const createPenumbraChannelTransport = async (
  requireProvider?: string,
  transportOptions: Omit<ChannelTransportOptions, 'getPort'> = { jsonOptions },
): Promise<Transport> => {
  const port = await getPenumbraPort(requireProvider);
  return createChannelTransport({
    ...transportOptions,
    getPort: () => Promise.resolve(port),
  });
};

/**
 * Synchronously create a client for `service` from the specified provider, or the
 * first available provider if unspecified.
 *
 * If the provider is unavailable, the client will fail to make requests.
 */
export const syncCreatePenumbraClient = <P extends PenumbraService>(
  service: P,
  requireProvider?: string,
) => createPromiseClient(service, syncCreatePenumbraChannelTransport(requireProvider));

/**
 * Asynchronously create a client for `service` from the specified provider, or
 * the first available provider if unspecified.
 *
 * Like `syncCreatePenumbraClient`, but awaits connection init.
 */
export const createPenumbraClient = async <P extends PenumbraService>(
  service: P,
  requireProvider?: string,
  transportOptions?: Omit<ChannelTransportOptions, 'getPort'>,
) =>
  createPromiseClient(
    service,
    await createPenumbraChannelTransport(requireProvider, transportOptions),
  );
