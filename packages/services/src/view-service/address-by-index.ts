import type { Impl } from '.';

import { getAddressByIndex } from '@penumbra-zone/wasm/src/keys';
import { fvkCtx } from '../ctx/full-viewing-key';

export const addressByIndex: Impl['addressByIndex'] = (req, ctx) => {
  const fullViewingKey = ctx.values.get(fvkCtx);
  if (!fullViewingKey) {
    throw new Error('Cannot access full viewing key');
  }
  const address = getAddressByIndex(fullViewingKey, req.addressIndex?.account ?? 0);

  return { address };
};
