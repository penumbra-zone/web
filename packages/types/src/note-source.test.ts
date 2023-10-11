import { describe, expect, it } from 'vitest';
import { Base64Str } from './base64';
import {
  isTransaction,
  noteSourceFromBase64Str,
  noteSourceFromBytes,
  ParsedNoteSource,
} from './note-source';
import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';

describe('noteSourceFromBase64Str', () => {
  it('should return the correct NoteSource', () => {
    const base64Str: Base64Str = 'F0omaN6jtfX5qpq3PNQWKh8zwM0QcdVqTMglFWqvjAY=';
    expect(noteSourceFromBase64Str(base64Str)).toBe(ParsedNoteSource.Transaction);
  });
});

describe('noteSourceFromBytes', () => {
  it('should return Transaction if the bytes represent a transaction', () => {
    const noteSource = new NoteSource({ inner: new Uint8Array(32) });
    noteSource.inner[22] = 7;
    expect(noteSourceFromBytes(noteSource)).toBe(ParsedNoteSource.Transaction);
  });

  it('should return the right note source per code marker', () => {
    const noteSource = new NoteSource({ inner: new Uint8Array(32) });
    noteSource.inner[23] = 0;
    expect(noteSourceFromBytes(noteSource)).toBe(ParsedNoteSource.Unknown);
    noteSource.inner[23] = 1;
    expect(noteSourceFromBytes(noteSource)).toBe(ParsedNoteSource.Genesis);
    noteSource.inner[23] = 2;
    expect(noteSourceFromBytes(noteSource)).toBe(ParsedNoteSource.FundingStreamReward);
    noteSource.inner[23] = 3;
    expect(noteSourceFromBytes(noteSource)).toBe(ParsedNoteSource.DaoOutput);
    noteSource.inner[23] = 4;
    expect(noteSourceFromBytes(noteSource)).toBe(ParsedNoteSource.Ics20Transfer);
    noteSource.inner[23] = 8;
    expect(noteSourceFromBytes(noteSource)).toBe(ParsedNoteSource.Unknown);
  });
});

describe('isTransaction', () => {
  it('should return true if the bytes represent a transaction', () => {
    const noteSource = new NoteSource({ inner: new Uint8Array(32) });
    noteSource.inner[22] = 9;
    expect(isTransaction(noteSource)).toBe(true);
  });

  it('should return false if the bytes do not represent a transaction', () => {
    const noteSource = new NoteSource({ inner: new Uint8Array(32) });
    expect(isTransaction(noteSource)).toBe(false);
  });
});
