import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { bech32Address } from '@penumbra-zone/types';
import { isControlledAddress } from '@penumbra-zone/wasm-ts';

export const indexByAddress: Impl['indexByAddress'] = async (req, ctx) => {
  if (!req.address) throw new Error('no address given in request');
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  const address = bech32Address(req.address);
  const addressIndex = isControlledAddress(fullViewingKey, address);
  if (!addressIndex) throw new Error('Address is not controlled by view service full viewing key');

  return { addressIndex };
};
