import { describe, expect, it } from 'vitest';
import { Base64Str } from './base64';
import {
  isTransaction,
  noteSourceFromBase64Str,
  noteSourceFromBytes,
  ParsedNoteSource,
} from './note-source';

describe('noteSourceFromBase64Str', () => {
  it('should return the correct NoteSource', () => {
    const base64Str: Base64Str = 'F0omaN6jtfX5qpq3PNQWKh8zwM0QcdVqTMglFWqvjAY=';
    expect(noteSourceFromBase64Str(base64Str)).toBe(ParsedNoteSource.Transaction);
  });
});

describe('noteSourceFromBytes', () => {
  it('should return Transaction if the bytes represent a transaction', () => {
    const bytes = new Uint8Array(32);
    bytes[22] = 7;
    expect(noteSourceFromBytes(bytes)).toBe(ParsedNoteSource.Transaction);
  });

  it('should return the right note source per code marker', () => {
    const bytes = new Uint8Array(32);
    bytes[23] = 0;
    expect(noteSourceFromBytes(bytes)).toBe(ParsedNoteSource.Unknown);
    bytes[23] = 1;
    expect(noteSourceFromBytes(bytes)).toBe(ParsedNoteSource.Genesis);
    bytes[23] = 2;
    expect(noteSourceFromBytes(bytes)).toBe(ParsedNoteSource.FundingStreamReward);
    bytes[23] = 3;
    expect(noteSourceFromBytes(bytes)).toBe(ParsedNoteSource.DaoOutput);
    bytes[23] = 4;
    expect(noteSourceFromBytes(bytes)).toBe(ParsedNoteSource.Ics20Transfer);
    bytes[23] = 8;
    expect(noteSourceFromBytes(bytes)).toBe(ParsedNoteSource.Unknown);
  });
});

describe('isTransaction', () => {
  it('should return true if the bytes represent a transaction', () => {
    const bytes = new Uint8Array(32);
    bytes[22] = 9;
    expect(isTransaction(bytes)).toBe(true);
  });

  it('should return false if the bytes do not represent a transaction', () => {
    const bytes = new Uint8Array(32);
    expect(isTransaction(bytes)).toBe(false);
  });
});
