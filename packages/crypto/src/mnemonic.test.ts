import { describe, expect, test } from 'vitest';
import { generateSeedPhrase, SeedPhraseLength } from './mnemonic';
import { wordlists } from 'bip39';

describe('Mnemonic tests', () => {
  test('can generate 128 bit phrases', () => {
    const seedPhrase = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
    expect(seedPhrase.length).toBe(12);
    for (const word of seedPhrase) {
      expect(wordlists['EN']?.includes(word)).toBeTruthy();
    }
  });

  test('can generate 256 bit phrases', () => {
    const seedPhrase = generateSeedPhrase(SeedPhraseLength.TWENTY_FOUR_WORDS);
    expect(seedPhrase.length).toBe(24);
    for (const word of seedPhrase) {
      expect(wordlists['EN']?.includes(word)).toBeTruthy();
    }
  });

  test('results are random each time', () => {
    const seedPhraseA = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
    const seedPhraseB = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
    const seedPhraseC = generateSeedPhrase(SeedPhraseLength.TWELVE_WORDS);

    expect(seedPhraseA).not.toStrictEqual(seedPhraseB);
    expect(seedPhraseA).not.toStrictEqual(seedPhraseC);
    expect(seedPhraseB).not.toStrictEqual(seedPhraseC);
  });
});
