import {
  NotesRequest,
  NotesResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface, uint8ArrayToString } from '@penumbra-zone/types';
import { localExtStorage } from '@penumbra-zone/storage';

export const isNotesRequest = (msg: ViewReqMessage): msg is NotesRequest => {
  return msg.getType().typeName === NotesRequest.typeName;
};

export const handleNotesReq = async function* (
  req: NotesRequest,
  services: ServicesInterface,
): AsyncIterable<NotesResponse> {
  const { indexedDb } = await services.getWalletServices();
  const allNotes = await indexedDb.getAllNotes();
  const wallets = await localExtStorage.get('wallets');

  if (
    req.walletId?.inner &&
    !wallets.find(wallet => wallet.id === uint8ArrayToString(req.walletId!.inner))
  ) {
    throw new Error('Invalid account ID');
  }

  const filteredNotes = allNotes
    // filter by assetId
    .filter(note => (req.assetId ? note.note?.value?.assetId?.equals(req.assetId) : note))
    // filter by addressIndex
    .filter(note => (req.addressIndex ? note.addressIndex?.equals(req.addressIndex) : note))
    // filter by heightSpent
    .filter(note => (!req.includeSpent ? !note.heightSpent : note));

  let response: SpendableNoteRecord[];

  if ((req.amountToSpend && (!req.assetId || req.includeSpent)) ?? !req.amountToSpend) {
    response = filteredNotes;
  } else {
    // filter by amountToSpend
    let sum = 0n;
    response = [];

    for (const note of filteredNotes) {
      sum = sum + (note.note?.value?.amount?.lo ?? 0n);
      if (sum <= req.amountToSpend.lo) {
        response.push(note);
      } else {
        break;
      }
    }
  }

  yield* response.map(note => {
    return new NotesResponse({
      noteRecord: note,
    });
  });
};
