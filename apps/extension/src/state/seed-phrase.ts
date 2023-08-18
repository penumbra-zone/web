import { SliceCreator } from './index';
import {
  generateSeedPhrase,
  SeedPhraseLength,
  ValidationField,
  validationFields,
} from 'penumbra-crypto-ts/src/mnemonic';

export interface SeedPhraseSlice {
  phrase: string[];
  validationFields: ValidationField[];
  userValidationAttempt: ValidationField[];
  generateRandomSeedPhrase: (length: SeedPhraseLength) => void;
  updateUserValidationAttempt: (field: ValidationField) => void;
  seedPhraseValidationCorrect: () => boolean;
}

export const createSeedPhraseSlice: SliceCreator<SeedPhraseSlice> = (set, get) => {
  return {
    phrase: [],
    validationFields: [],
    userValidationAttempt: [],
    generateRandomSeedPhrase: (length) => {
      set((state) => {
        const newSeedPhrase = generateSeedPhrase(length);
        state.seedPhrase.phrase = newSeedPhrase;
        state.seedPhrase.validationFields = validationFields(newSeedPhrase, 3);
        state.seedPhrase.userValidationAttempt = [];
      });
    },
    updateUserValidationAttempt: (attempt) => {
      set((state) => {
        const match = state.seedPhrase.userValidationAttempt.find((v) => v.index === attempt.index);
        if (match) {
          match.word = attempt.word;
        } else {
          state.seedPhrase.userValidationAttempt.push(attempt);
        }
      });
    },
    seedPhraseValidationCorrect: () => {
      const { userValidationAttempt, validationFields } = get().seedPhrase;
      return (
        userValidationAttempt.length === validationFields.length &&
        userValidationAttempt.every((f) => {
          return validationFields.find((v) => v.index === f.index)?.word === f.word;
        })
      );
    },
  };
};
