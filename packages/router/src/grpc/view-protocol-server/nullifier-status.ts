import {
  NullifierStatusRequest,
  NullifierStatusResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';
import { assertWalletIdMatches } from './utils';

export const isNullifierStatusRequest = (req: ViewReqMessage): req is NullifierStatusRequest => {
  return req.getType().typeName === NullifierStatusRequest.typeName;
};

export const handleNullifierStatusReq = async (
  req: NullifierStatusRequest,
  services: ServicesInterface,
): Promise<NullifierStatusResponse> => {
  await assertWalletIdMatches(req.walletId);

  const { indexedDb } = await services.getWalletServices();
  if (!req.nullifier) return new NullifierStatusResponse();

  const noteByNullifier = await indexedDb.getNoteByNullifier(req.nullifier);
  const swapByNullifier = await indexedDb.getSwapByNullifier(req.nullifier);

  // The 'heightSpent' and 'heightClaimed' fields will never be undefined,
  // so we compare to 0n assuming it is impossible to spend nullifier in block 0
  const noteSpent = noteByNullifier ? noteByNullifier.heightSpent !== 0n : false;
  const swapSpent = swapByNullifier ? swapByNullifier.heightClaimed !== 0n : false;

  if (noteSpent || swapSpent) {
    return new NullifierStatusResponse({ spent: true });
  } else if (!req.awaitDetection) {
    return new NullifierStatusResponse({ spent: false });
  }

  // Wait until our DB encounters a new note with this nullifier
  const subscription = indexedDb.subscribe('SPENDABLE_NOTES');
  for await (const update of subscription) {
    const note = SpendableNoteRecord.fromJson(update.value);
    if (note.nullifier?.equals(req.nullifier)) break;
  }

  return new NullifierStatusResponse({ spent: true });
};
