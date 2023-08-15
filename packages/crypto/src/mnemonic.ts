import { generateMnemonic } from 'bip39';

export enum SeedPhraseLength {
  TWELVE_WORDS, // 128bits
  TWENTY_FOUR_WORDS, // 256bits
}

export const generateSeedPhrase = (length: SeedPhraseLength): string[] => {
  const entropy = length === SeedPhraseLength.TWELVE_WORDS ? 128 : 256;
  return generateMnemonic(entropy).split(' ');
};
