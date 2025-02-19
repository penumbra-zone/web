import { IdbConstants } from '@penumbra-zone/types/indexed-db';
import { AddressIndex, IdentityKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { get_voting_notes } from '../wasm/index.js';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Jsonified } from '@penumbra-zone/types/jsonified';

/**
 * Utility that returns delegation voting notes to be used in the liquidity tournament.
 */
export const getVotingNotes = async (
  address_index: AddressIndex,
  votable_at_height: bigint,
  idbConstants: IdbConstants,
): Promise<[SpendableNoteRecord, IdentityKey][]> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- JsValue coming out of wasm
  const votingNotes: [Jsonified<SpendableNoteRecord>, Jsonified<IdentityKey>][] =
    await get_voting_notes(address_index.toBinary(), votable_at_height, idbConstants);

  return votingNotes.map(([note, identityKey]) => [
    SpendableNoteRecord.fromJson(note),
    IdentityKey.fromJson(identityKey),
  ]);
};
