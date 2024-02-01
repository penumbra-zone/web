import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { getAddressByIndex } from '@penumbra-zone/wasm-ts';

export const addressByIndex: Impl['addressByIndex'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  if (!req.addressIndex) {
    throw new Error('Missing address index');
  }
  const address = getAddressByIndex(fullViewingKey, req.addressIndex.account);

  return { address };
};
