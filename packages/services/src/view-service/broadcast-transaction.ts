import type { Impl } from '.';

import { Code, ConnectError } from '@connectrpc/connect';
import { dbCtx } from '../ctx/database';
import { fullnodeCtx } from '../ctx/fullnode';
import { publishTransaction } from './fullnode/transaction';

export const broadcastTransaction: Impl['broadcastTransaction'] = async function* (req, ctx) {
  const indexedDb = await ctx.values.get(dbCtx)();
  const fullnode = await ctx.values.get(fullnodeCtx)();

  if (!req.transaction)
    throw new ConnectError('No transaction provided in request', Code.InvalidArgument);

  // start subscription early to prevent race condition
  const subscription = indexedDb.subscribeTransactionInfo();

  const id = await publishTransaction(fullnode, req.transaction);
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
