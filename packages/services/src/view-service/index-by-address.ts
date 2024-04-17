import type { Impl } from '.';

import { getAddressIndexByAddress } from '@penumbra-zone/wasm/src/address';

import { Code, ConnectError } from '@connectrpc/connect';
import { fvkCtx } from '../ctx/full-viewing-key';

export const indexByAddress: Impl['indexByAddress'] = (req, ctx) => {
  if (!req.address) throw new ConnectError('no address given in request', Code.InvalidArgument);
  const fullViewingKey = ctx.values.get(fvkCtx);
  if (!fullViewingKey) {
    throw new Error('Cannot access full viewing key');
  }
  const addressIndex = getAddressIndexByAddress(fullViewingKey, req.address);

  if (!addressIndex) return {};

  return { addressIndex };
};
