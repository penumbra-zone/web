import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { watchSubscription } from './util/watch-subscription';

import {
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

import { ConnectError, Code } from '@connectrpc/connect';

export const nullifierStatus: Impl['nullifierStatus'] = async (
  { awaitDetection, nullifier: findNullifier },
  ctx,
) => {
  if (!findNullifier) throw new ConnectError('No nullifier passed', Code.InvalidArgument);

  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  // grab subscription to table updates before checking the tables.  this avoids
  // a race condition: if instead we checked the tables, and *then* subscribed,
  // it would be possible to miss updates that arrived in the short time between
  // the two calls.
  const swapStream = indexedDb.subscribe('SWAPS');
  const noteStream = indexedDb.subscribe('SPENDABLE_NOTES');

  // If present, a swap or note should never have an undefined height, and a
  // zero-height spend should never appear. So if one of these is truthy, the
  // nullifier is spent.
  const [swap, note] = await Promise.all([
    indexedDb.getSwapByNullifier(findNullifier),
    indexedDb.getSpendableNoteByNullifier(findNullifier),
  ]);

  const spent =
    Boolean(swap?.heightClaimed) ||
    Boolean(note?.heightSpent) ||
    Boolean(
      awaitDetection &&
        // use of the nullifier was not present in db, so watch that subscription.
        // we might double-check very recent items, but we won't miss any.
        (await Promise.race([
          watchSubscription(swapStream, ({ value: swapJson }) => {
            const swap = SwapRecord.fromJson(swapJson);
            return Boolean(swap.heightClaimed) && findNullifier.equals(swap.nullifier);
          }),
          watchSubscription(noteStream, ({ value: noteJson }) => {
            const note = SpendableNoteRecord.fromJson(noteJson);
            return Boolean(note.heightSpent) && findNullifier.equals(note.nullifier);
          }),
        ])),
    );

  return { spent };
};
