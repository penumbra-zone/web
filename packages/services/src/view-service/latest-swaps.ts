import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  generateTransactionInfo,
  generateTransactionSummary,
} from '@penumbra-zone/wasm/transaction';
import { fvkCtx } from '../ctx/full-viewing-key.js';

export const latestSwaps: Impl['latestSwaps'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const fvk = ctx.values.get(fvkCtx);

  for await (const txRecord of indexedDb.iterateTransactions()) {
    // yield { LatestSwapsResponse object } if the transaction requested from storage
    // is a swap.
  }
};
