import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';

export const latestSwaps: Impl['latestSwaps'] = async function* (_req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  // todo: need to account for optional filters in the incoming `LatestSwapsRequest`.

  // yield BSOD existing swaps and unclaimed swaps, where an unclaimed swap
  // is defined as `heightClaimed === 0n`.
  for await (const swapRecord of indexedDb.iterateSwaps()) {
    if (swapRecord.source?.source.case == 'transaction') {
      yield {
        input: new Value({
          amount: swapRecord.outputData?.delta1,
          assetId: swapRecord.outputData?.tradingPair?.asset1,
        }),
        output: new Value({
          amount: swapRecord.outputData?.delta2,
          assetId: swapRecord.outputData?.tradingPair?.asset2,
        }),
        blockHeight: swapRecord.heightClaimed,
        id: new TransactionId({ inner: swapRecord.source.source.value.id }),
      };
    }
  }
};
