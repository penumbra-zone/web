import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { getAddressByIndex } from '@penumbra-zone/wasm/src/keys';

export const addressByIndex: Impl['addressByIndex'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  const address = getAddressByIndex(fullViewingKey, req.addressIndex?.account ?? 0);

  return { address };
};
