import { IdbConstants } from '@penumbra-zone/types/indexed-db';
import { fromJson, toBinary } from '@bufbuild/protobuf';
import {
  AddressIndexSchema,
  IdentityKeySchema,
  type AddressIndex,
  type IdentityKey,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import {
  SpendableNoteRecordSchema,
  type SpendableNoteRecord,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Jsonified } from '@penumbra-zone/types/jsonified';
import { get_voting_notes } from '../wasm/index.js';

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
    await get_voting_notes(
      toBinary(AddressIndexSchema, address_index),
      votable_at_height,
      idbConstants,
    );

  return votingNotes.map(([note, identityKey]) => [
    fromJson(SpendableNoteRecordSchema, note),
    fromJson(IdentityKeySchema, identityKey),
  ]);
};
