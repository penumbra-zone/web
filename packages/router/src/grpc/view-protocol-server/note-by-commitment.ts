import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { watchSubscription } from './util/watch-subscription';

import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

import { ConnectError, Code } from '@connectrpc/connect';

export const noteByCommitment: Impl['noteByCommitment'] = async (
  { noteCommitment: findNoteCommitment, awaitDetection },
  ctx,
) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  if (!findNoteCommitment)
    throw new ConnectError('Missing note commitment in request', Code.InvalidArgument);

  // start subscription early to avoid race condition
  const subscription = indexedDb.subscribe('SPENDABLE_NOTES');

  const spendableNote =
    (await indexedDb.getSpendableNoteByCommitment(findNoteCommitment)) ??
    (awaitDetection &&
      SpendableNoteRecord.fromJson(
        await watchSubscription(subscription, update => {
          const scannedNote = SpendableNoteRecord.fromJson(update.value);
          return findNoteCommitment.equals(scannedNote.noteCommitment);
        }).catch(),
      ));

  if (spendableNote) return { spendableNote };

  throw new ConnectError('Note not found', Code.NotFound);
};
