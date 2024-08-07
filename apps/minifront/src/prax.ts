import { PromiseClient } from '@connectrpc/connect';
import { createPenumbraClient } from '@penumbra-zone/client';
import { assertProviderConnected, assertProviderManifest } from '@penumbra-zone/client/assert';
import { PenumbraService } from '@penumbra-zone/protobuf';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_origin = `chrome-extension://${prax_id}`;

export const penumbraClient = createPenumbraClient();

// If Prax is connected on page load, reconnect to ensure the connection is still active
if (penumbraClient.getProviderIsConnected(prax_origin)) {
  void penumbraClient.connect(prax_origin).catch(() => {
    /* no-op */
  });
}

export const getPraxOrigin = () => prax_origin;

export const getPraxManifest = () => penumbraClient.getProviderManifest(prax_origin);

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

export const requestPraxAccess = async () => penumbraClient.connect(prax_origin);

export const createPraxClient = <T extends PenumbraService>(service: T): PromiseClient<T> =>
  penumbraClient.service(service);
