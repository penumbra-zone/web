import { PromiseClient } from '@connectrpc/connect';
import { PenumbraClient } from '@penumbra-zone/client';
import { assertProviderConnected, assertProviderManifest } from '@penumbra-zone/client/assert';
import { PenumbraService } from '@penumbra-zone/protobuf';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_origin = `chrome-extension://${prax_id}`;

export const throwIfPraxNotConnected = () => assertProviderConnected(prax_origin);
export const throwIfPraxNotInstalled = () => assertProviderManifest(prax_origin);
export const isPraxInstalled = () =>
  assertProviderManifest().then(
    () => true,
    () => false,
  );

export const isPraxConnected = () => PenumbraClient.providerIsConnected(prax_origin);

export const penumbraClient = new PenumbraClient(prax_origin);
export const requestPraxAccess = () => penumbraClient.connect();
export const createPraxClient = <T extends PenumbraService>(service: T): PromiseClient<T> =>
  penumbraClient.service(service);
