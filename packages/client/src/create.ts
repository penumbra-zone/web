import { createPromiseClient, type Transport } from '@connectrpc/connect';
import { jsonOptions, type PenumbraService } from '@penumbra-zone/protobuf';
import {
  createChannelTransport,
  type ChannelTransportOptions,
} from '@penumbra-zone/transport-dom/create';
import { assertProviderManifest, assertProviderRecord } from './assert.js';
import { PenumbraSymbol } from './symbol.js';

// Naively return the first available provider origin, or `undefined`.
const availableOrigin = () => Object.keys(window[PenumbraSymbol] ?? {})[0];

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
  const penumbraOrigin = requireProvider ?? availableOrigin();
  await assertProviderManifest(penumbraOrigin);
  const provider = assertProviderRecord(penumbraOrigin);
  if (!provider.isConnected()) {
    await provider.request();
  }
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
export const createPenumbraChannelTransportSync = (
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
export const createPenumbraClientSync = <P extends PenumbraService>(
  service: P,
  requireProvider?: string,
) => createPromiseClient(service, createPenumbraChannelTransportSync(requireProvider));

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
