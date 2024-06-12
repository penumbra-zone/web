import type { Impl } from '.';

import { Code, ConnectError } from '@connectrpc/connect';
import { dbCtx } from '../ctx/database';

export const swapByCommitment: Impl['swapByCommitment'] = async (req, ctx) => {
  const indexedDb = await ctx.values.get(dbCtx)();
  const { swapCommitment } = req;
  if (!swapCommitment)
    throw new ConnectError('Missing swap commitment in request', Code.InvalidArgument);

  const swap = await indexedDb.getSwapByCommitment(swapCommitment);
  if (swap) return { swap };

  if (req.awaitDetection) {
    for await (const swap of indexedDb.subscribeSwapRecords()) {
      console.log('awaited swap', swap);
      if (swap.swapCommitment?.equals(swapCommitment)) return { swap };
    }
  }

  throw new ConnectError('Swap not found', Code.NotFound);
};
