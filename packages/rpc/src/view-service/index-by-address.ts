import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';

import { getAddressIndexByAddress } from '@penumbra-zone/wasm/src/address';

import { Code, ConnectError } from '@connectrpc/connect';

export const indexByAddress: Impl['indexByAddress'] = async (req, ctx) => {
  if (!req.address) throw new ConnectError('no address given in request', Code.InvalidArgument);
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  const addressIndex = getAddressIndexByAddress(fullViewingKey, req.address);

  if (!addressIndex) return {};

  return { addressIndex };
};
