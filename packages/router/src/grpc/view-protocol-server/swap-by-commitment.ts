import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

import { ConnectError, Code } from '@connectrpc/connect';

export const swapByCommitment: Impl['swapByCommitment'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const { swapCommitment } = req;
  if (!swapCommitment)
    throw new ConnectError('Missing swap commitment in request', Code.InvalidArgument);

  const swap = await indexedDb.getSwapByCommitment(swapCommitment);
  if (swap) return { swap };

  if (req.awaitDetection) {
    for await (const { value: swapJson } of indexedDb.subscribe('SWAPS')) {
      const swap = SwapRecord.fromJson(swapJson);
      if (swap.swapCommitment?.equals(swapCommitment)) return { swap };
    }
  }

  throw new ConnectError('Swap not found', Code.NotFound);
};
