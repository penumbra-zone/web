import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import type { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const swapByCommitment: Impl['swapByCommitment'] = async (req, ctx) => {
  const idb = await ctx.values.get(idbCtx)();
  const { swapCommitment } = req;
  if (!swapCommitment)
    throw new ConnectError('Missing swap commitment in request', Code.InvalidArgument);

  const swap = await idb.getSwapByCommitment(swapCommitment);
  if (swap) return { swap };

  if (req.awaitDetection) {
    for await (const { value: swapJson } of idb.subscribe('SWAPS')) {
      const swap = SwapRecord.fromJson(swapJson);
      if (swap.swapCommitment?.equals(swapCommitment)) return { swap };
    }
  }

  throw new ConnectError('Swap not found', Code.NotFound);
};
