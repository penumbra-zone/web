import { describe, expect, test } from 'vitest';
import {
  generateSeedPhrase,
  generateValidationFields,
  isInWordList,
  SeedPhraseLength,
  validateSeedPhrase,
} from './mnemonic';
import { wordlists } from 'bip39';

describe('Mnemonic tests', () => {
  describe('generateSeedPhrase()', () => {
    test('can generate 128 bit phrases', () => {
      const seedPhrase = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
      expect(seedPhrase.length).toBe(12);
      for (const word of seedPhrase) 
        expect(wordlists['EN']?.includes(word)).toBeTruthy();
      
    });

    test('can generate 256 bit phrases', () => {
      const seedPhrase = generateSeedPhrase(SeedPhraseLength.TWENTY_FOUR_WORDS);
      expect(seedPhrase.length).toBe(24);
      for (const word of seedPhrase) 
        expect(wordlists['EN']?.includes(word)).toBeTruthy();
      
    });

    test('results are random each time', () => {
      const seedPhraseA = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
      const seedPhraseB = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
      const seedPhraseC = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);

      expect(seedPhraseA).not.toStrictEqual(seedPhraseB);
      expect(seedPhraseA).not.toStrictEqual(seedPhraseC);
      expect(seedPhraseB).not.toStrictEqual(seedPhraseC);
    });

    test('are always valid', () => {
      Array.from({ length: 200 }).forEach(() => {
        const seedPhraseShort = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
        expect(validateSeedPhrase(seedPhraseShort)).toBeTruthy();

        const seedPhraseLong = generateSeedPhrase(SeedPhraseLength.TWENTY_FOUR_WORDS);
        expect(validateSeedPhrase(seedPhraseLong)).toBeTruthy();
      });
    });
  });

  describe('generateValidationFields()', () => {
    const valuesAscend = (arr: number[]) => arr.every((v, i, a) => !i || a[i - 1]! <= v);

    test('returns fields that correspond to phrase', () => {
      // As it's random, run many times
      Array.from({ length: 200 }).forEach(() => {
        const seedPhrase = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
        const fields = generateValidationFields(seedPhrase, 3);
        const allMatch = fields.every(f => seedPhrase.at(f.index) === f.word);
        expect(allMatch).toBeTruthy();

        const isAscendingByIndex = valuesAscend(fields.map(f => f.index));
        expect(isAscendingByIndex).toBeTruthy();
      });
    });

    test('works with 24 words as well', () => {
      Array.from({ length: 200 }).forEach(() => {
        const seedPhrase = generateSeedPhrase(SeedPhraseLength.TWENTY_FOUR_WORDS);
        const fields = generateValidationFields(seedPhrase, 5);
        const allMatch = fields.every(f => seedPhrase.at(f.index) === f.word);
        expect(allMatch).toBeTruthy();

        const isAscendingByIndex = valuesAscend(fields.map(f => f.index));
        expect(isAscendingByIndex).toBeTruthy();
      });
    });
  });

  describe('validateSeedPhrase()', () => {
    test('returns true on known valid addresses', () => {
      const validSeedPhraseA = [
        'cancel',
        'tilt',
        'shallow',
        'way',
        'roast',
        'utility',
        'profit',
        'satoshi',
        'mushroom',
        'seek',
        'shift',
        'helmet',
      ];
      const validSeedPhraseB = [
        'blouse',
        'injury',
        'into',
        'among',
        'depend',
        'flash',
        'blossom',
        'accuse',
        'empower',
        'swear',
        'merit',
        'tail',
        'rude',
        'stuff',
        'abuse',
        'noodle',
        'sniff',
        'element',
        'bubble',
        'monster',
        'put',
        'satoshi',
        'behave',
        'intact',
      ];
      expect(validateSeedPhrase(validSeedPhraseA)).toBeTruthy();
      expect(validateSeedPhrase(validSeedPhraseB)).toBeTruthy();
    });

    test('returns false on invalid seed phrases', () => {
      const none: string[] = [];
      const tooShort = ['cancel', 'tilt', 'shallow', 'way'];
      const invalidCharacter = ['%'];
      const wrongEndingWord = [
        'cancel',
        'tilt',
        'shallow',
        'way',
        'roast',
        'utility',
        'profit',
        'satoshi',
        'mushroom',
        'seek',
        'shift',
        'cancel', // should be helmet
      ];
      expect(validateSeedPhrase(none)).toBeFalsy();
      expect(validateSeedPhrase(tooShort)).toBeFalsy();
      expect(validateSeedPhrase(invalidCharacter)).toBeFalsy();
      expect(validateSeedPhrase(wrongEndingWord)).toBeFalsy();
    });
  });

  describe('isInWordList()', () => {
    test('returns true on valid words', () => {
      const validWords = [
        'cancel',
        'tilt',
        'shallow',
        'way',
        'roast',
        'utility',
        'profit',
        'satoshi',
        'mushroom',
        'seek',
        'shift',
        'helmet',
      ];
      validWords.forEach(w => {
        expect(isInWordList(w)).toBeTruthy();
      });
    });

    test('returns false on invalid words', () => {
      const invalidWords = [
        'Haus',
        'Tisch',
        'Auto',
        'Blume',
        'Baum',
        'Telefon',
        'Fenster',
        'Stuhl',
        'Buch',
        'Schule',
      ];
      invalidWords.forEach(w => {
        expect(isInWordList(w)).toBeFalsy();
      });
    });
  });
});
