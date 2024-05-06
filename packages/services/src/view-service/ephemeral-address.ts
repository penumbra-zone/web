import type { Impl } from '.';

import { getEphemeralByIndex } from '@penumbra-zone/wasm/keys';
import { fvkCtx } from '../ctx/full-viewing-key';

export const ephemeralAddress: Impl['ephemeralAddress'] = async (req, ctx) => {
  if (!req.addressIndex) {
    throw new Error('Missing address index');
  }
  const fvk = ctx.values.get(fvkCtx);
  const address = getEphemeralByIndex(await fvk(), req.addressIndex.account);

  return { address };
};
