import { createPromiseClient, PromiseClient, Transport } from '@connectrpc/connect';
import { getPenumbraManifest } from '@penumbra-zone/client';
import {
  assertProvider,
  assertProviderConnected,
  assertProviderManifest,
} from '@penumbra-zone/client/assert';
import { createPenumbraChannelTransportSync } from '@penumbra-zone/client/create';
import { jsonOptions, PenumbraService } from '@penumbra-zone/protobuf';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_origin = `chrome-extension://${prax_id}`;

export const getPraxOrigin = () => prax_origin;

export const getPraxManifest = () => getPenumbraManifest(prax_origin);

export const isPraxConnected = () => {
  try {
    assertProviderConnected(prax_origin);
    return true;
  } catch {
    return false;
  }
};

export const isPraxInstalled = async () => {
  try {
    await assertProviderManifest(prax_origin);
    return true;
  } catch {
    return false;
  }
};

export const throwIfPraxNotConnected = () => assertProviderConnected(prax_origin);

export const throwIfPraxNotInstalled = async () => assertProviderManifest(prax_origin);

export const requestPraxAccess = () => assertProvider(prax_origin).then(p => p.request());

export const createPraxTransport = () =>
  createPenumbraChannelTransportSync(prax_origin, { jsonOptions });

let praxTransport: Transport | undefined;
export const createPraxClient = <T extends PenumbraService>(service: T): PromiseClient<T> =>
  createPromiseClient(service, (praxTransport ??= createPraxTransport()));
