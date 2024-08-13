import { createPenumbraClient, PenumbraClient } from '@penumbra-zone/client';

const prax_id = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
export const prax = new URL(`chrome-extension://${prax_id}`);

export const penumbra = createPenumbraClient(prax.origin);

export const isPenumbraInstalled = () => Object.keys(PenumbraClient.getProviders()).includes(prax.origin);
