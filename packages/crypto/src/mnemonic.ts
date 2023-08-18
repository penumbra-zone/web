import { generateMnemonic, validateMnemonic, wordlists } from 'bip39';
import { sampleSize } from 'lodash';

export enum SeedPhraseLength {
  TWELVE_WORDS = 12, // 128bits
  TWENTY_FOUR_WORDS = 24, // 256bits
}

export const generateSeedPhrase = (length: SeedPhraseLength): string[] => {
  const entropy = length === SeedPhraseLength.TWELVE_WORDS ? 128 : 256;
  return generateMnemonic(entropy).split(' ');
};

export interface ValidationField {
  word: string;
  index: number;
}

const sortByIndex = (fieldA: ValidationField, fieldB: ValidationField) =>
  fieldA.index - fieldB.index;

export const validationFields = (seedPhrase: string[], amount: number): ValidationField[] => {
  const allWords = seedPhrase.map((word, index) => ({ word, index }));
  return sampleSize(allWords, amount).sort(sortByIndex);
};

export const validateSeedPhrase = (seedPhrase: string[]): boolean => {
  return validateMnemonic(seedPhrase.join(' '));
};

export const isInWordList = (word: string): boolean => {
  return wordlists['EN']!.includes(word);
};
