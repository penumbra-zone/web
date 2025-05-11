import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import {
  DirectedTradingPair,
  TradingPair,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { getAddressByIndex } from '@penumbra-zone/wasm/keys';

export const latestSwaps: Impl['latestSwaps'] = async function* (_req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const fvk = ctx.values.get(fvkCtx);

  const { indexedDb } = await services.getWalletServices();

  const accountFilter = _req.accountFilter
    ? getAddressByIndex(await fvk(), _req.accountFilter.account)
    : undefined;
  const pairFilter = _req.pair
    ? new TradingPair({ asset1: _req.pair.start, asset2: _req.pair.end })
    : undefined;

  let counter = 0n;

  // yield BSOD existing swaps and unclaimed swaps, where an unclaimed swap
  // is defined as `heightClaimed === 0n`.
  for await (const swapRecord of indexedDb.iterateSwaps()) {
    if (_req.responseLimit && counter >= _req.responseLimit) {
      break;
    }

    if (
      swapRecord.source?.source.case === 'transaction' &&
      swapRecord.swap?.claimAddress &&
      swapRecord.outputData?.tradingPair &&
      (!_req.afterHeight || swapRecord.heightClaimed > _req.afterHeight) &&
      (!accountFilter || swapRecord.swap.claimAddress.equals(accountFilter)) &&
      (!pairFilter || swapRecord.outputData.tradingPair.equals(pairFilter))
    ) {
      counter++;
      yield {
        id: new TransactionId({ inner: swapRecord.source.source.value.id }),
        blockHeight: swapRecord.outputData.height,
        pair: new DirectedTradingPair({
          start: swapRecord.outputData.tradingPair.asset1,
          end: swapRecord.outputData.tradingPair.asset2,
        }),
        input: new Value({
          amount: swapRecord.outputData.delta1,
          assetId: swapRecord.outputData.tradingPair.asset1,
        }),
        output: new Value({
          amount: swapRecord.outputData.delta2,
          assetId: swapRecord.outputData.tradingPair.asset2,
        }),
      };
    }
  }
};
