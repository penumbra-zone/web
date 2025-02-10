import { IdbConstants } from '@penumbra-zone/types/indexed-db';
import { AddressIndex, IdentityKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { get_voting_notes } from '../wasm/index.js';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const getVotingNotes = async (
  address_index: AddressIndex,
  votable_at_height: bigint,
  idbConstants: IdbConstants,
): Promise<[SpendableNoteRecord, IdentityKey][]> => {
  console.log('entered getVotingNotes!');
  const voting_notes: any[] = await get_voting_notes(
    address_index.toBinary(),
    votable_at_height,
    idbConstants,
  );

  return voting_notes.map(([note, identityKey]) => [
    SpendableNoteRecord.fromJson(note),
    IdentityKey.fromJson(identityKey),
  ]);
};
