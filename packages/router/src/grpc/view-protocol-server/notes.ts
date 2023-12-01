import {
  NotesRequest,
  NotesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import {
  ServicesInterface,
  addAmounts,
  joinLoHiAmount,
  uint8ArrayToString,
} from '@penumbra-zone/types';
import { localExtStorage } from '@penumbra-zone/storage';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';

export const isNotesRequest = (msg: ViewReqMessage): msg is NotesRequest => {
  return msg.getType().typeName === NotesRequest.typeName;
};

// If wallet id passed in req, ensure it's in storage
async function assertWalletIdMatches(req: NotesRequest) {
  const wallets = await localExtStorage.get('wallets');
  if (
    req.walletId?.inner &&
    !wallets.find(wallet => wallet.id === uint8ArrayToString(req.walletId!.inner))
  ) {
    throw new Error('walletId does not match walletIds in storage');
  }
}

export const handleNotesReq = async function* (
  req: NotesRequest,
  services: ServicesInterface,
): AsyncIterable<NotesResponse> {
  await assertWalletIdMatches(req);

  const { indexedDb } = await services.getWalletServices();
  const allNotes = await indexedDb.getAllNotes();

  const { assetId, addressIndex, includeSpent, amountToSpend } = req;

  let spent = new Amount();

  yield* allNotes
    .filter(n => (assetId ? n.note?.value?.assetId?.equals(assetId) : true))
    .filter(n => (addressIndex ? n.addressIndex?.equals(addressIndex) : true))
    .filter(n => (!includeSpent ? !n.heightSpent : true))
    .filter(n => {
      // If set, stop returning notes once the total exceeds this amount.
      // Ignored if `assetId` is unset or if `includeSpent` is set.
      if (!(amountToSpend && assetId && !includeSpent)) return true;

      const noteAmount = n.note?.value?.amount ?? new Amount();
      spent = addAmounts(spent, noteAmount);

      return joinLoHiAmount(spent) <= joinLoHiAmount(amountToSpend);
    })
    .map(noteRecord => new NotesResponse({ noteRecord }));
};
