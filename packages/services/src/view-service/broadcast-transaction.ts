import type { Impl } from '.';

import { servicesCtx } from '../ctx/prax';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { sha256Hash } from '@penumbra-zone/crypto-web/sha256';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { dbCtx } from '../ctx/database';

export const broadcastTransaction: Impl['broadcastTransaction'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const indexedDb = await ctx.values.get(dbCtx)();
  const { querier } = await services.getWalletServices();
  if (!req.transaction)
    throw new ConnectError('No transaction provided in request', Code.InvalidArgument);

  // start subscription early to prevent race condition
  const subscription = indexedDb.subscribeTransactionInfo();

  const id = new TransactionId({ inner: await sha256Hash(req.transaction.toBinary()) });

  const broadcastId = await querier.tendermint.broadcastTx(req.transaction);
  if (!id.equals(broadcastId)) {
    console.error('broadcast transaction id disagrees', id, broadcastId);
    throw new Error(
      `broadcast transaction id disagrees: expected ${uint8ArrayToHex(id.inner)} but tendermint ${uint8ArrayToHex(broadcastId.inner)}`,
    );
  }

  yield {
    status: {
      case: 'broadcastSuccess',
      value: { id },
    },
  };

  if (!req.awaitDetection) return;

  // Wait until DB records a new transaction with this id
  for await (const { height: detectionHeight, id: detectionId } of subscription) {
    if (id.equals(detectionId)) {
      yield {
        status: {
          case: 'confirmed',
          value: { id, detectionHeight },
        },
      };
      return;
    }
  }

  throw new Error('subscription ended');
};
