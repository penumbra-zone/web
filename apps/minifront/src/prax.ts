import { createPromiseClient, PromiseClient, Transport } from '@connectrpc/connect';
import {
  assertProviderConnected,
  assertProviderManifest,
  getPenumbraPort,
  syncCreatePenumbraChannelTransport,
} from '@penumbra-zone/client/create';
import { jsonOptions, PenumbraService } from '@penumbra-zone/protobuf';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_origin = `chrome-extension://${prax_id}`;

export const getPraxOrigin = () => prax_origin;

export const getPraxManifest = async () => {
  const { manifest } = await assertProviderManifest(prax_origin);
  const requestManifest = await fetch(manifest);
  return (await requestManifest.json()) as unknown;
};

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
    await assertProviderManifest();
    return true;
  } catch {
    return false;
  }
};

export const throwIfPraxNotConnected = () => assertProviderConnected(prax_origin);

export const throwIfPraxNotInstalled = async () => assertProviderManifest(prax_origin);

export const getPraxPort = () => getPenumbraPort(prax_origin);

export const requestPraxAccess = () => getPraxPort();

export const praxTransportOptions = {
  jsonOptions,
  getPort: getPraxPort,
};

export const createPraxTransport = () => syncCreatePenumbraChannelTransport(prax_origin);

let praxTransport: Transport | undefined;
export const createPraxClient = <T extends PenumbraService>(service: T): PromiseClient<T> =>
  createPromiseClient(service, (praxTransport ??= createPraxTransport()));
