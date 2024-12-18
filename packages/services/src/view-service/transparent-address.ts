import type { Impl } from './index.js';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { getTransparentAddress } from '@penumbra-zone/wasm/keys';

export const transparentAddress: Impl['transparentAddress'] = async (_, ctx) => {
  const fvk = await ctx.values.get(fvkCtx)();
  const t_addr = getTransparentAddress(fvk);

  return {
    address: t_addr.address,
    encoding: t_addr.encoding,
  };

  //   return new TransparentAddressResponse({
  //     address: t_addr.address,
  //     encoding: t_addr.encoding,
  //   });
};
