import type { Impl } from '.';

import { getAddressByIndex } from '@penumbra-zone/wasm/keys';
import { fvkCtx } from '../ctx/full-viewing-key';

export const addressByIndex: Impl['addressByIndex'] = async (req, ctx) => {
  const fvk = ctx.values.get(fvkCtx);
  const address = getAddressByIndex(await fvk(), req.addressIndex?.account ?? 0);
  return { address };
};
