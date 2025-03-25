import type { Impl } from './index.js';
import { equals, fromJson } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax.js';

import { SwapRecordSchema } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { Code, ConnectError } from '@connectrpc/connect';
import { StateCommitmentSchema } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';

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
      const swap = fromJson(SwapRecordSchema, swapJson);
      if (
        swap.swapCommitment &&
        equals(StateCommitmentSchema, swap.swapCommitment, swapCommitment)
      ) {
        return { swap };
      }
    }
  }

  throw new ConnectError('Swap not found', Code.NotFound);
};
