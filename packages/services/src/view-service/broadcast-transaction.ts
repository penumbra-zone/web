import type { Impl } from './index.js';
import { create, equals, fromJson, toBinary } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { TransactionIdSchema } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { sha256Hash } from '@penumbra-zone/crypto-web/sha256';
import { TransactionInfoSchema } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { TransactionSchema } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

export const broadcastTransaction: Impl['broadcastTransaction'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();
  if (!req.transaction) {
    throw new ConnectError('No transaction provided in request', Code.InvalidArgument);
  }

  // start subscription early to prevent race condition
  const subscription = indexedDb.subscribe('TRANSACTIONS');

  const id = create(TransactionIdSchema, {
    inner: await sha256Hash(toBinary(TransactionSchema, req.transaction)),
  });

  const broadcastId = await querier.tendermint.broadcastTx(req.transaction);
  if (!equals(TransactionIdSchema, id, broadcastId)) {
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

  if (!req.awaitDetection) {
    return;
  }

  // Wait until DB records a new transaction with this id
  for await (const { value } of subscription) {
    const { height: detectionHeight, id: detectionId } = fromJson(TransactionInfoSchema, value);
    if (detectionId && equals(TransactionIdSchema, id, detectionId)) {
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
