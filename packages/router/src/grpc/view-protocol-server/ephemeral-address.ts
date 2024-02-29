import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { getEphemeralByIndex } from '@penumbra-zone/wasm';

export const ephemeralAddress: Impl['ephemeralAddress'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  if (!req.addressIndex) 
    throw new Error('Missing address index');
  
  const address = getEphemeralByIndex(fullViewingKey, req.addressIndex.account);

  return { address };
};
