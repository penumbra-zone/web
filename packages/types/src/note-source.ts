import { Base64Str, base64ToUint8Array } from './base64';
import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';

export enum ParsedNoteSource {
  Transaction = 'Transaction',
  Genesis = 'Genesis',
  FundingStreamReward = 'FundingStreamReward',
  DaoOutput = 'DaoOutput',
  Ics20Transfer = 'Ics20Transfer',
  Unknown = 'Unknown',
}

export const noteSourceFromBase64Str = (str: Base64Str): ParsedNoteSource => {
  const bytes = base64ToUint8Array(str);
  return noteSourceFromBytes(new NoteSource({ inner: bytes }));
};

const CODE_INDEX = 23;

// Logic adapted from: https://github.com/penumbra-zone/penumbra/blob/main/crates/core/component/chain/src/note_source.rs
export const noteSourceFromBytes = (noteSource: NoteSource): ParsedNoteSource => {
  if (isTransaction(noteSource)) return ParsedNoteSource.Transaction;

  const code = noteSource.inner[CODE_INDEX];

  const data = noteSource.inner.slice(CODE_INDEX + 1);
  if (!code || !data.every(byte => byte === 0)) return ParsedNoteSource.Unknown;

  switch (code) {
    case 0:
      return ParsedNoteSource.Unknown;
    case 1:
      return ParsedNoteSource.Genesis;
    case 2:
      return ParsedNoteSource.FundingStreamReward;
    case 3:
      return ParsedNoteSource.DaoOutput;
    case 4:
      return ParsedNoteSource.Ics20Transfer;
    default:
      return ParsedNoteSource.Unknown;
  }
};

// if the first 23 bytes are all 0, it's not a transaction
export const isTransaction = (noteSource: NoteSource) => {
  return !noteSource.inner.slice(0, CODE_INDEX).every(byte => byte === 0);
};
