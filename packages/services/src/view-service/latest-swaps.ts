import type { Impl } from './index.js';
import { create, equals } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { ValueSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionIdSchema } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import {
  DirectedTradingPairSchema,
  TradingPairSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { getAddressByIndex } from '@penumbra-zone/wasm/keys';
import { AddressSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const latestSwaps: Impl['latestSwaps'] = async function* (_req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const fvk = ctx.values.get(fvkCtx);

  const { indexedDb } = await services.getWalletServices();

  const accountFilter = _req.accountFilter
    ? getAddressByIndex(await fvk(), _req.accountFilter.account)
    : undefined;
  const pairFilter = _req.pair
    ? create(TradingPairSchema, { asset1: _req.pair.start, asset2: _req.pair.end })
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
      (!accountFilter || equals(AddressSchema, swapRecord.swap.claimAddress, accountFilter)) &&
      (!pairFilter || equals(TradingPairSchema, swapRecord.outputData.tradingPair, pairFilter))
    ) {
      counter++;
      yield {
        id: create(TransactionIdSchema, { inner: swapRecord.source.source.value.id }),
        blockHeight: swapRecord.outputData.height,
        pair: create(DirectedTradingPairSchema, {
          start: swapRecord.outputData.tradingPair.asset1,
          end: swapRecord.outputData.tradingPair.asset2,
        }),
        input: create(ValueSchema, {
          amount: swapRecord.outputData.delta1,
          assetId: swapRecord.outputData.tradingPair.asset1,
        }),
        output: create(ValueSchema, {
          amount: swapRecord.outputData.delta2,
          assetId: swapRecord.outputData.tradingPair.asset2,
        }),
      };
    }
  }
};
