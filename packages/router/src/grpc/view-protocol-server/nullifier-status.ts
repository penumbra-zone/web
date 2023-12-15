import {
  NullifierStatusRequest,
  NullifierStatusResponse,
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { IndexedDbInterface, ServicesInterface } from '@penumbra-zone/types';
import { assertWalletIdMatches } from './utils';
import type { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';

export const isNullifierStatusRequest = (req: ViewReqMessage): req is NullifierStatusRequest => {
  return req.getType().typeName === NullifierStatusRequest.typeName;
};

async function noteOrSwapSpent(
  indexedDb: IndexedDbInterface,
  nullifier: Nullifier,
): Promise<boolean> {
  const noteByNullifier = await indexedDb.getNoteByNullifier(nullifier);
  const swapByNullifier = await indexedDb.getSwapByNullifier(nullifier);

  // The 'heightSpent' and 'heightClaimed' fields will never be undefined,
  // so we compare to 0n assuming it is impossible to spend nullifier in block 0
  const noteSpent = noteByNullifier ? noteByNullifier.heightSpent !== 0n : false;
  const swapSpent = swapByNullifier ? swapByNullifier.heightClaimed !== 0n : false;
  return noteSpent || swapSpent;
}

export const handleNullifierStatusReq = async (
  req: NullifierStatusRequest,
  services: ServicesInterface,
): Promise<NullifierStatusResponse> => {
  await assertWalletIdMatches(req.walletId);
  if (!req.nullifier) throw new Error('No nullifier passed');

  const { indexedDb } = await services.getWalletServices();
  const spent = await noteOrSwapSpent(indexedDb, req.nullifier);

  if (spent) {
    return new NullifierStatusResponse({ spent: true });
  } else if (!req.awaitDetection) {
    return new NullifierStatusResponse({ spent: false });
  }

  // Wait until our DB encounters a new note or swap. If it corresponds to the nullifier, break loop.
  const mergedSubscription = mergeAsyncGenerators(
    indexedDb.subscribe('SPENDABLE_NOTES'),
    indexedDb.subscribe('SWAPS'),
  );

  for await (const update of mergedSubscription) {
    if (update.table === 'SPENDABLE_NOTES') {
      const note = SpendableNoteRecord.fromJson(update.value);
      if (note.nullifier?.equals(req.nullifier) && note.heightSpent !== 0n) break;
    } else {
      const swap = SwapRecord.fromJson(update.value);
      if (swap.nullifier?.equals(req.nullifier) && swap.heightClaimed !== 0n) break;
    }
  }

  return new NullifierStatusResponse({ spent: true });
};

// Yield's first available value on two async generators. Also assumes they run forever.
async function* mergeAsyncGenerators<T, U>(
  gen1: AsyncGenerator<T>,
  gen2: AsyncGenerator<U>,
): AsyncGenerator<T | U> {
  while (true) {
    const result = await Promise.race([gen1.next(), gen2.next()]);
    yield result.value;
  }
}
