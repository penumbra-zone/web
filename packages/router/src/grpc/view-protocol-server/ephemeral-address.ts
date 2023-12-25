import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { getEphemeralByIndex } from '@penumbra-zone/wasm-ts';

export const ephemeralAddress: Impl['ephemeralAddress'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  const address = getEphemeralByIndex(fullViewingKey, req.addressIndex?.account ?? 0);
  return { address };
};
