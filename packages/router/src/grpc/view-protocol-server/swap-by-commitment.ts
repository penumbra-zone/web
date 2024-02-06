import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { watchSubscription } from './util/watch-subscription';

import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

import { ConnectError, Code } from '@connectrpc/connect';

export const swapByCommitment: Impl['swapByCommitment'] = async (
  { swapCommitment: findSwapCommitment, awaitDetection },
  ctx,
) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  if (!findSwapCommitment)
    throw new ConnectError('Missing swap commitment in request', Code.InvalidArgument);

  // start subscription early to avoid race condition
  const subscription = indexedDb.subscribe('SWAPS');

  const swap =
    (await indexedDb.getSwapByCommitment(findSwapCommitment)) ??
    (awaitDetection &&
      SwapRecord.fromJson(
        await watchSubscription(subscription, update => {
          const scannedSwap = SwapRecord.fromJson(update.value);
          return findSwapCommitment.equals(scannedSwap.swapCommitment);
        }).catch(),
      ));

  if (swap) return { swap };

  throw new ConnectError('Swap not found', Code.NotFound);
};
