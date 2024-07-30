import { createPromiseClient, PromiseClient, Transport } from '@connectrpc/connect';
import { createPenumbraClient, getPenumbraManifest } from '@penumbra-zone/client';
import { assertProviderConnected, assertProviderManifest } from '@penumbra-zone/client/assert';
import { jsonOptions, PenumbraService } from '@penumbra-zone/protobuf';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';

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

export const penumbraClient = createPenumbraClient();

export const requestPraxAccess = async () => penumbraClient.connect(prax_origin);

export const createPraxTransport = () => {
  const port = Promise.withResolvers<MessagePort>();
  if (penumbraClient.isConnected()) {
    port.resolve(penumbraClient.getMessagePort());
  } else {
    penumbraClient.onConnectionChange(detail => {
      if (detail.connected) {
        port.resolve(penumbraClient.getMessagePort());
      }
    });
  }
  return createChannelTransport({
    getPort: () => port.promise,
    jsonOptions,
  });
};

let praxTransport: Transport | undefined;
export const createPraxClient = <T extends PenumbraService>(service: T): PromiseClient<T> =>
  createPromiseClient(service, (praxTransport ??= createPraxTransport()));
