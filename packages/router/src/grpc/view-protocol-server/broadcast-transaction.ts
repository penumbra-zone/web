import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { watchSubscription } from './util/watch-subscription';

import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

import { ConnectError, Code } from '@connectrpc/connect';

import { sha256Hash } from '@penumbra-zone/crypto-web';
import { uint8ArrayToHex } from '@penumbra-zone/types';

export const broadcastTransaction: Impl['broadcastTransaction'] = async function* (
  { transaction, awaitDetection },
  ctx,
) {
  const services = ctx.values.get(servicesCtx);
  const { tendermint } = services.querier;
  const { indexedDb } = await services.getWalletServices();
  if (!transaction)
    throw new ConnectError('No transaction provided in request', Code.InvalidArgument);

  // start subscription early to prevent race condition
  const subscription = indexedDb.subscribe('TRANSACTION_INFO');

  const id = new TransactionId({ inner: await sha256Hash(transaction.toBinary()) });

  const broadcastId = await tendermint.broadcastTx(transaction);
  if (!id.equals(broadcastId)) {
    console.error('broadcast transaction id disagrees', id, broadcastId);
    throw new Error(
      `broadcast transaction id disagrees: expected ${uint8ArrayToHex(id.inner)} != tendermint ${uint8ArrayToHex(broadcastId.inner)}`,
    );
  }

  yield {
    status: {
      case: 'broadcastSuccess',
      value: { id },
    },
  };

  if (!awaitDetection) return;

  // Wait until DB records a new transaction with this id
  const { height: detectionHeight } = TransactionInfo.fromJson(
    await watchSubscription(subscription, ({ value }) => {
      const { id: scanningId } = TransactionInfo.fromJson(value);
      return id.equals(scanningId);
    }),
  );

  yield {
    status: {
      case: 'confirmed',
      value: { id, detectionHeight },
    },
  };
};
