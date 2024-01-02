import {
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import type { Impl } from '.';
import { servicesCtx, hasWalletCtx } from '../../ctx';

import { ConnectError, Code } from '@connectrpc/connect';

const watchStream = async <U>(
  subscription: AsyncGenerator<U>,
  test: (x: U) => boolean,
): Promise<U> => {
  for await (const update of subscription) if (test(update)) return update;
  throw new Error('Subscription ended');
};

export const nullifierStatus: Impl['nullifierStatus'] = async (req, ctx) => {
  const hasWallet = ctx.values.get(hasWalletCtx);
  await hasWallet(req.walletId);

  const { nullifier } = req;
  if (!nullifier) throw new ConnectError('No nullifier passed', Code.InvalidArgument);

  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  // grab subscription before local check. this avoids race condition
  const swapStream = indexedDb.subscribe('SWAPS');
  const noteStream = indexedDb.subscribe('SPENDABLE_NOTES');

  // If present, a swap or note should never have an undefined height, and a
  // zero-height spend should never appear. So if one of these is truthy, the
  // nullifier is spent.
  const [swap, note] = await Promise.all([
    indexedDb.getSwapByNullifier(nullifier),
    indexedDb.getNoteByNullifier(nullifier),
  ]);
  const spent = Boolean(swap?.heightClaimed) || Boolean(note?.heightSpent);

  if (!spent && req.awaitDetection) {
    // use of the nullifier was not present in local data, so watch new data.
    // we might check a few very recent items twice, if they were included in
    // local check, but we won't miss anything.
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
