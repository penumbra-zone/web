import { createPenumbraClient } from '@penumbra-zone/client';

const PRAX_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';
export const PRAX_ORIGIN = new URL(`chrome-extension://${PRAX_ID}`).origin;

export const penumbra = createPenumbraClient();
