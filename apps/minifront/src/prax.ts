import { createPenumbraClient, PenumbraManifest } from '@penumbra-zone/client';
import { assertProviderConnected, assertProviderManifest } from '@penumbra-zone/client/assert';
import { useEffect, useState } from 'react';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_origin = new URL(`chrome-extension://${prax_id}`).origin;

export const penumbra = createPenumbraClient(prax_origin);

export const throwIfPraxNotConnected = () => assertProviderConnected(prax_origin);
export const throwIfPraxNotInstalled = () => assertProviderManifest(prax_origin);
export const isPraxInstalled = () =>
  assertProviderManifest(prax_origin).then(
    () => true,
    () => false,
  );

export const usePraxManifest = (): PenumbraManifest | undefined => {
  const [manifest, setManifest] = useState<PenumbraManifest>();

  useEffect(() => {
    setManifest(penumbra.manifest);
    penumbra.onConnectionStateChange(() => {
      setManifest(penumbra.manifest);
    });
  }, []);

  return manifest;
};
