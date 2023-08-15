import { SliceCreator } from './index';
import { generateSeedPhrase, SeedPhraseLength } from 'penumbra-crypto-ts/src/mnemonic';

export interface OnboardingSlice {
  plaintextPassword: string;
  seedPhrase: string[];
  generateRandomSeedPhrase: (length: SeedPhraseLength) => void;
}

export const createOnboardingSlice: SliceCreator<OnboardingSlice> = (set) => {
  return {
    plaintextPassword: '',
    seedPhrase: [],
    generateRandomSeedPhrase: (length) => {
      set((state) => {
        state.onboarding.seedPhrase = generateSeedPhrase(length);
      });
    },
  };
};
