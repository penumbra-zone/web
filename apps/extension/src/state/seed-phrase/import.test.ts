import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '..';
import { beforeEach, describe, expect, test } from 'vitest';
import { SeedPhraseLength } from '@penumbra-zone/crypto-web/src/mnemonic';
import {
  mockLocalExtStorage,
  mockSessionExtStorage,
} from '@penumbra-zone/storage/src/chrome/test-utils/mock';

describe('Import Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), mockLocalExtStorage()));
  });

  test('the default is empty', () => {
    expect(useStore.getState().seedPhrase.import.phrase).toEqual([]);
  });

  describe('setLength()', () => {
    test('does not resize if the same with 12', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      expect(useStore.getState().seedPhrase.import.phrase.length).toBe(12);
      useStore.getState().seedPhrase.import.update('abc', 0);
      useStore.getState().seedPhrase.import.update('def', 8);
      useStore.getState().seedPhrase.import.update('ghi', 11);
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      expect(useStore.getState().seedPhrase.import.phrase.length).toBe(12);

      // Expect no changes to have been made
      const phrase = useStore.getState().seedPhrase.import.phrase;
      expect(phrase[0]).toBe('abc');
      expect(phrase[8]).toBe('def');
      expect(phrase[11]).toBe('ghi');
    });

    test('does not resize if the same with 24', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWENTY_FOUR_WORDS);
      expect(useStore.getState().seedPhrase.import.phrase.length).toBe(24);
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWENTY_FOUR_WORDS);
      expect(useStore.getState().seedPhrase.import.phrase.length).toBe(24);
    });

    test('grows if shorter', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      useStore.getState().seedPhrase.import.update('abc', 0);
      useStore.getState().seedPhrase.import.update('def', 8);
      useStore.getState().seedPhrase.import.update('ghi', 11);
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWENTY_FOUR_WORDS);
      expect(useStore.getState().seedPhrase.import.phrase.length).toBe(24);

      // Expect no changes to have been made to existing fields
      const phrase = useStore.getState().seedPhrase.import.phrase;
      expect(phrase[0]).toBe('abc');
      expect(phrase[8]).toBe('def');
      expect(phrase[11]).toBe('ghi');

      // New fields are ""
      for (let i = 12; i < 24; i++) {
        expect(phrase[i]).toBe('');
      }
    });

    test('chops if longer', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWENTY_FOUR_WORDS);
      useStore.getState().seedPhrase.import.update('ghi', 11);
      useStore.getState().seedPhrase.import.update('jkl', 14);
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      expect(useStore.getState().seedPhrase.import.phrase.length).toBe(12);

      // Expect no changes to have been made to fields less than index 12
      const phrase = useStore.getState().seedPhrase.import.phrase;
      expect(phrase[11]).toBe('ghi');

      // Chopped phrases are undefined
      expect(phrase[14]).toBeUndefined();
    });
  });

  describe('update()', () => {
    test('works with one word', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      useStore.getState().seedPhrase.import.update('abc', 11);
      expect(useStore.getState().seedPhrase.import.phrase[11]).toBe('abc');
    });

    test('trims word and does not mutate next slot', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      useStore.getState().seedPhrase.import.update('def', 9);
      useStore.getState().seedPhrase.import.update('abc ', 8);
      expect(useStore.getState().seedPhrase.import.phrase[8]).toBe('abc');
      expect(useStore.getState().seedPhrase.import.phrase[9]).toBe('def');
    });

    test('spreads multiple', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      useStore.getState().seedPhrase.import.update('abc def ghi', 0);
      expect(useStore.getState().seedPhrase.import.phrase[0]).toBe('abc');
      expect(useStore.getState().seedPhrase.import.phrase[1]).toBe('def');
      expect(useStore.getState().seedPhrase.import.phrase[2]).toBe('ghi');
    });

    test('can start at later field', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      useStore.getState().seedPhrase.import.update('abc def ghi', 3);
      expect(useStore.getState().seedPhrase.import.phrase[3]).toBe('abc');
      expect(useStore.getState().seedPhrase.import.phrase[4]).toBe('def');
      expect(useStore.getState().seedPhrase.import.phrase[5]).toBe('ghi');
    });

    test('does not extend beyond length', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      useStore.getState().seedPhrase.import.update('abc def ghi', 10);
      expect(useStore.getState().seedPhrase.import.phrase[10]).toBe('abc');
      expect(useStore.getState().seedPhrase.import.phrase[11]).toBe('def');
      expect(useStore.getState().seedPhrase.import.phrase[12]).toBeUndefined();
    });

    test('Extends seed phrase length if pasting longer than twelve', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      useStore
        .getState()
        .seedPhrase.import.update(
          'bronze planet clay differ remove obtain board sniff install web flavor slot stomach settle door spike test isolate butter cinnamon keen lock guide payment',
          0,
        );
      expect(useStore.getState().seedPhrase.import.phrase.length).toBe(
        SeedPhraseLength.TWENTY_FOUR_WORDS,
      );
      expect(useStore.getState().seedPhrase.import.phrase[22]).toBe('guide');
      expect(useStore.getState().seedPhrase.import.phrase[23]).toBe('payment');
    });

    test('Extending beyond twenty four trims ending', () => {
      useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
      useStore
        .getState()
        .seedPhrase.import.update(
          'bronze planet clay differ remove obtain board sniff install web flavor slot stomach settle door spike test isolate butter cinnamon keen lock guide payment longer words do not show',
          0,
        );
      expect(useStore.getState().seedPhrase.import.phrase.length).toBe(
        SeedPhraseLength.TWENTY_FOUR_WORDS,
      );
      expect(useStore.getState().seedPhrase.import.phrase[22]).toBe('guide');
      expect(useStore.getState().seedPhrase.import.phrase[23]).toBe('payment');
      expect(useStore.getState().seedPhrase.import.phrase[24]).toBeUndefined();
      expect(useStore.getState().seedPhrase.import.phrase[25]).toBeUndefined();
    });
  });

  test('wordIsValid()', () => {
    expect(useStore.getState().seedPhrase.import.wordIsValid('abbble')).toBeFalsy();
    expect(useStore.getState().seedPhrase.import.wordIsValid('able')).toBeTruthy();
  });

  test('phraseIsValid()', () => {
    useStore.getState().seedPhrase.import.setLength(SeedPhraseLength.TWELVE_WORDS);
    useStore
      .getState()
      .seedPhrase.import.update(
        'drift inspire erupt mix pig split tone weather bullet develop tilt stool',
        0,
      );
    expect(useStore.getState().seedPhrase.import.phraseIsValid()).toBeTruthy();

    useStore
      .getState()
      .seedPhrase.import.update(
        'drift inspire erupt mix pig split tone weather bullet develop moooooo stool',
        0,
      );
    expect(useStore.getState().seedPhrase.import.phraseIsValid()).toBeFalsy();
  });
});
