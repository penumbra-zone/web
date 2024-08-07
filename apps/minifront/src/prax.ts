import { PenumbraClient } from '@penumbra-zone/client';
import { assertProviderConnected, assertProviderManifest } from '@penumbra-zone/client/assert';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_origin = new URL(`chrome-extension://${prax_id}`).origin;

export const praxClient = PenumbraClient.create(prax_origin);

export const throwIfPraxNotConnected = () => assertProviderConnected(prax_origin);
export const throwIfPraxNotInstalled = () => assertProviderManifest(prax_origin);
export const isPraxInstalled = () =>
  assertProviderManifest(prax_origin).then(
    () => true,
    () => false,
  );
