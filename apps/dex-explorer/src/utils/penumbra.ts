import { createPenumbraClient, PenumbraManifest } from '@penumbra-zone/client';
import { useEffect, useState } from 'react';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
const prax_origin = new URL(`chrome-extension://${prax_id}`).origin;

export const penumbra = createPenumbraClient(prax_origin);

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
