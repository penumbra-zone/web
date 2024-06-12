import type { Impl } from '.';

import {
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { dbCtx } from '../ctx/database';

const watchStream = async <U>(
  subscription: AsyncGenerator<U>,
  test: (x: U) => boolean,
): Promise<U> => {
  for await (const update of subscription) if (test(update)) return update;
  throw new Error('Subscription ended');
};

export const nullifierStatus: Impl['nullifierStatus'] = async (req, ctx) => {
  const { nullifier } = req;
  if (!nullifier) throw new ConnectError('No nullifier passed', Code.InvalidArgument);

  const indexedDb = await ctx.values.get(dbCtx)();

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
    indexedDb.getSwapByNullifier(nullifier),
    indexedDb.getSpendableNoteByNullifier(nullifier),
  ]);
  const spent = Boolean(swap?.heightClaimed) || Boolean(note?.heightSpent);

  if (!spent && req.awaitDetection) {
    // use of the nullifier was not present in db, so watch that subscription.
    // we might double-check very recent items, but we won't miss any.
    const eventuallySpent = Promise.race([
      watchStream(swapStream, ({ value: swapJson }) => {
        const swap = SwapRecord.fromJson(swapJson);
        return Boolean(swap.heightClaimed) && nullifier.equals(swap.nullifier);
      }),
      watchStream(noteStream, ({ value: noteJson }) => {
        const note = SpendableNoteRecord.fromJson(noteJson);
        return Boolean(note.heightSpent) && nullifier.equals(note.nullifier);
      }),
    ]);
    return eventuallySpent.then(() => ({ spent: true }));
  }

  return { spent };
};
