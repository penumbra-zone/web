import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { isControlledAddress } from '@penumbra-zone/wasm';

import { Code, ConnectError } from '@connectrpc/connect';
import { bech32Address } from '@penumbra-zone/types/src/address';

export const indexByAddress: Impl['indexByAddress'] = async (req, ctx) => {
  if (!req.address) throw new ConnectError('no address given in request', Code.InvalidArgument);
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  const address = bech32Address(req.address);

  const addressIndex = isControlledAddress(fullViewingKey, address);

  if (!addressIndex) return {};

  return { addressIndex };
};
