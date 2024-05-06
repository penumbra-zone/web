import type { Impl } from '.';

import { getAddressIndexByAddress } from '@penumbra-zone/wasm/address';

import { Code, ConnectError } from '@connectrpc/connect';
import { fvkCtx } from '../ctx/full-viewing-key';

export const indexByAddress: Impl['indexByAddress'] = async (req, ctx) => {
  if (!req.address) throw new ConnectError('no address given in request', Code.InvalidArgument);
  const fvk = ctx.values.get(fvkCtx);
  const addressIndex = getAddressIndexByAddress(await fvk(), req.address);

  if (!addressIndex) return {};

  return { addressIndex };
};
