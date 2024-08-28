import { generateMnemonic, validateMnemonic, wordlists } from 'bip39';

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

export const generateValidationFields = (
  seedPhrase: string[],
  amount: number,
): ValidationField[] => {
  const allWords: ValidationField[] = seedPhrase.map((word, index) => ({ word, index }));
  const shuffleWords = allWords.sort(() => 0.5 - Math.random());
  const pickWords = shuffleWords.slice(0, amount);
  return pickWords.sort((a, b) => a.index - b.index);
};

export const validateSeedPhrase = (seedPhrase: string[]): boolean => {
  return validateMnemonic(seedPhrase.join(' '));
};

export const isInWordList = (word: string): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify non-null assertion
  return wordlists['EN']!.includes(word);
};
