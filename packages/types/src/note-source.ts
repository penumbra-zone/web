import { Base64Str, base64ToUint8Array } from './base64';

export enum NoteSource {
  Transaction = 'Transaction',
  Genesis = 'Genesis',
  FundingStreamReward = 'FundingStreamReward',
  DaoOutput = 'DaoOutput',
  Ics20Transfer = 'Ics20Transfer',
  Unknown = 'Unknown',
}

export const noteSourceFromBase64Str = (str: Base64Str): NoteSource => {
  const bytes = base64ToUint8Array(str);
  return noteSourceFromBytes(bytes);
};

const CODE_INDEX = 23;

// Logic adapted from: https://github.com/penumbra-zone/penumbra/blob/main/crates/core/component/chain/src/note_source.rs
export const noteSourceFromBytes = (bytes: Uint8Array): NoteSource => {
  if (isTransaction(bytes)) return NoteSource.Transaction;

  const code = bytes[CODE_INDEX];

  const data = bytes.slice(CODE_INDEX + 1);
  if (!code || !data.every(byte => byte === 0)) return NoteSource.Unknown;

  switch (code) {
    case 0:
      return NoteSource.Unknown;
    case 1:
      return NoteSource.Genesis;
    case 2:
      return NoteSource.FundingStreamReward;
    case 3:
      return NoteSource.DaoOutput;
    case 4:
      return NoteSource.Ics20Transfer;
    default:
      return NoteSource.Unknown;
  }
};

// if the first 23 bytes are all 0, it's not a transaction
export const isTransaction = (bytes: Uint8Array) => {
  return !bytes.slice(0, CODE_INDEX).every(byte => byte === 0);
};
