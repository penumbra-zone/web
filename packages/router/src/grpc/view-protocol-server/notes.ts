import {
  NotesRequest,
  NotesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';

export const isNotesRequest = (msg: ViewReqMessage): msg is NotesRequest => {
  return msg.getType().typeName === NotesRequest.typeName;
};

export const handleNotesReq = async function* (
  req: NotesRequest,
  services: ServicesInterface,
): AsyncIterable<NotesResponse> {
  const { indexedDb } = await services.getWalletServices();
  const allNotes = await indexedDb.getAllNotes();

  // If set, return spent notes as well as unspent notes.
  // bool include_spent = 2;
  // If set, only return notes with the specified asset id.
  // penumbra.core.asset.v1alpha1.AssetId asset_id = 3;
  // If set, only return notes with the specified address incore.component.dex.v1alpha1.
  // penumbra.core.keys.v1alpha1.AddressIndex address_index = 4;
  // If set, stop returning notes once the total exceeds this amount.
  // Ignored if `asset_id` is unset or if `include_spent` is set.
  // penumbra.core.num.v1alpha1.Amount amount_to_spend = 6;
  // Identifies the wallet id to query.
  // penumbra.core.keys.v1alpha1.WalletId wallet_id = 14;

  let res;
  if (req.includeSpent) {
    res = allNotes;
  } else {
    res = allNotes.filter(note => !note.heightSpent);
  }

  yield* res.map(note => {
    return new NotesResponse({
      noteRecord: note,
    });
  });
};
