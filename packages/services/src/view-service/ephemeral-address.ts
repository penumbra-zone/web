import type { Impl } from '.';

import { getEphemeralByIndex } from '@penumbra-zone/wasm/keys';
import { fvkCtx } from '../ctx/full-viewing-key';
import { Code, ConnectError } from '@connectrpc/connect';

export const ephemeralAddress: Impl['ephemeralAddress'] = (req, ctx) => {
  if (!req.addressIndex) {
    throw new Error('Missing address index');
  }
  const fullViewingKey = ctx.values.get(fvkCtx);
  if (!fullViewingKey) {
    throw new ConnectError('Cannot access full viewing key', Code.Unauthenticated);
  }
  const address = getEphemeralByIndex(fullViewingKey, req.addressIndex.account);

  return { address };
};
