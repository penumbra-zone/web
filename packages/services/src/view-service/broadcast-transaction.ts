import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { sha256Hash } from '@penumbra-zone/crypto-web/sha256';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

export const broadcastTransaction: Impl['broadcastTransaction'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { tendermint } = services.querier;
  const { indexedDb } = await services.getWalletServices();
  if (!req.transaction)
    throw new ConnectError('No transaction provided in request', Code.InvalidArgument);

  // start subscription early to prevent race condition
  const subscription = indexedDb.subscribe('TRANSACTIONS');

  const id = new TransactionId({ inner: await sha256Hash(req.transaction.toBinary()) });

  const broadcastId = await tendermint.broadcastTx(req.transaction);
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
  for await (const { value } of subscription) {
    const { height: detectionHeight, id: detectionId } = TransactionInfo.fromJson(value);
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
