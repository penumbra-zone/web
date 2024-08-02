import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

import { SwapRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { Code, ConnectError } from '@connectrpc/connect';

export const swapByCommitment: Impl['swapByCommitment'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();
  const { swapCommitment } = req;
  if (!swapCommitment) {
    throw new ConnectError('Missing swap commitment in request', Code.InvalidArgument);
  }

  const swap = await indexedDb.getSwapByCommitment(swapCommitment);
  if (swap) {
    return { swap };
  }

  if (req.awaitDetection) {
    for await (const { value: swapJson } of indexedDb.subscribe('SWAPS')) {
      const swap = SwapRecord.fromJson(swapJson);
      if (swap.swapCommitment?.equals(swapCommitment)) {
        return { swap };
      }
    }
  }

  throw new ConnectError('Swap not found', Code.NotFound);
};
