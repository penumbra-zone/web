import type { Impl } from '.';

import { getEphemeralByIndex } from '@penumbra-zone/wasm/src/keys';
import { fvkCtx } from '../ctx/full-viewing-key';

export const ephemeralAddress: Impl['ephemeralAddress'] = (req, ctx) => {
  if (!req.addressIndex) {
    throw new Error('Missing address index');
  }
  const fullViewingKey = ctx.values.get(fvkCtx);
  if (!fullViewingKey) {
    throw new Error('Cannot access full viewing key');
  }
  const address = getEphemeralByIndex(fullViewingKey, req.addressIndex.account);

  return { address };
};
