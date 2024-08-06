import { PromiseClient } from '@connectrpc/connect';
import {
  createPenumbraClient,
  createServiceClient,
  getPenumbraManifest,
} from '@penumbra-zone/client';
import { assertProviderConnected, assertProviderManifest } from '@penumbra-zone/client/assert';
import { PenumbraService } from '@penumbra-zone/protobuf';

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
void penumbraClient.reconnect();

export const requestPraxAccess = async () => penumbraClient.connect(prax_origin);

export const createPraxClient = <T extends PenumbraService>(service: T): PromiseClient<T> =>
  createServiceClient(penumbraClient, service);
