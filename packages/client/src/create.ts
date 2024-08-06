import { createPromiseClient, type Transport } from '@connectrpc/connect';
import { jsonOptions, type PenumbraService } from '@penumbra-zone/protobuf';
import {
  createChannelTransport,
  type ChannelTransportOptions,
} from '@penumbra-zone/transport-dom/create';
import { assertProviderManifest, assertProviderRecord } from './assert.js';

/**
 * Asynchronously get a connection to the specified provider.
 *
 * Confirms presence of the provider's manifest.  Will attempt to request
 * approval if connection is not already active.
 *
 * @param requireProvider string identifying a provider origin
 */
export const getPenumbraPort = async (requireProvider: string) => {
  await assertProviderManifest(requireProvider);
  const provider = assertProviderRecord(requireProvider);
  return provider.connect();
};

/**
 * Synchronously create a channel transport for the specified provider.
 *
 * Will always succeed, but the transport may fail if the provider is not
 * present, or if the provider rejects the connection.
 *
 * Confirms presence of the provider's manifest.  Will attempt to request
 * approval if connection is not already active.
 *
 * @param requireProvider string identifying a provider origin
 * @param transportOptions optional `ChannelTransportOptions` without `getPort`
 */
export const createPenumbraChannelTransportSync = (
  requireProvider: string,
  transportOptions: Omit<ChannelTransportOptions, 'getPort'> = { jsonOptions },
): Transport =>
  createChannelTransport({
    ...transportOptions,
    getPort: () => getPenumbraPort(requireProvider),
  });

/**
 * Asynchronously create a channel transport for the specified provider.
 *
 * Like `syncCreatePenumbraChannelTransport`, but awaits connection init.
 */
export const createPenumbraChannelTransport = async (
  requireProvider: string,
  transportOptions: Omit<ChannelTransportOptions, 'getPort'> = { jsonOptions },
): Promise<Transport> => {
  const port = await getPenumbraPort(requireProvider);
  return createChannelTransport({
    ...transportOptions,
    getPort: () => Promise.resolve(port),
  });
};

/**
 * Synchronously create a client for `service` from the specified provider.
 *
 * If the provider is unavailable, the client will fail to make requests.
 */
export const createPenumbraClientSync = <P extends PenumbraService>(
  service: P,
  requireProvider: string,
  transportOptions?: Omit<ChannelTransportOptions, 'getPort'>,
) =>
  createPromiseClient(
    service,
    createPenumbraChannelTransportSync(requireProvider, transportOptions),
  );

/**
 * Asynchronously create a client for `service` from the specified provider.
 *
 * Like `syncCreatePenumbraClient`, but awaits connection init.
 */
export const createPenumbraClient = async <P extends PenumbraService>(
  service: P,
  requireProvider: string,
  transportOptions?: Omit<ChannelTransportOptions, 'getPort'>,
) =>
  createPromiseClient(
    service,
    await createPenumbraChannelTransport(requireProvider, transportOptions),
  );
