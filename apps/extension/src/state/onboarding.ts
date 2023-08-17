import { SliceCreator } from './index';
import {
  generateSeedPhrase,
  SeedPhraseLength,
  ValidationField,
  validationFields,
} from 'penumbra-crypto-ts/src/mnemonic';

export interface OnboardingSlice {
  plaintextPassword: string;
  seedPhrase: string[];
  validationFields: ValidationField[];
  userValidationAttempt: ValidationField[];
  generateRandomSeedPhrase: (length: SeedPhraseLength) => void;
  updateUserAttempt: (field: ValidationField) => void;
  allCorrect: () => boolean;
}

export const createOnboardingSlice: SliceCreator<OnboardingSlice> = (set, get) => {
  return {
    plaintextPassword: '',
    seedPhrase: [],
    validationFields: [],
    userValidationAttempt: [],
    generateRandomSeedPhrase: (length) => {
      set((state) => {
        const newSeedPhrase = generateSeedPhrase(length);
        state.onboarding.seedPhrase = newSeedPhrase;
        state.onboarding.validationFields = validationFields(newSeedPhrase, 3);
        state.onboarding.userValidationAttempt = [];
      });
    },
    updateUserAttempt: (attempt) => {
      set((state) => {
        const match = state.onboarding.userValidationAttempt.find((v) => v.index === attempt.index);
        if (match) {
          match.word = attempt.word;
        } else {
          state.onboarding.userValidationAttempt.push(attempt);
        }
      });
    },
    allCorrect: () => {
      const { userValidationAttempt, validationFields } = get().onboarding;
      return (
        userValidationAttempt.length === validationFields.length &&
        userValidationAttempt.every((f) => {
          return validationFields.find((v) => v.index === f.index)?.word === f.word;
        })
      );
    },
  };
};
