import { SliceCreator } from '../index';
import { SeedPhraseSlice } from './index';
import {
  generateSeedPhrase,
  SeedPhraseLength,
  ValidationField,
  validationFields,
} from 'penumbra-crypto-ts/src/mnemonic';

export interface GenerateFields {
  phrase: string[];
  generateRandomSeedPhrase: (length: SeedPhraseLength) => void;
  validationFields: ValidationField[];
  userValidationAttempt: ValidationField[];
  updateAttempt: (field: ValidationField) => void;
  userAttemptCorrect: () => boolean;
  cleanup: () => void;
}

export const createGenerate: SliceCreator<SeedPhraseSlice['generate']> = (set, get) => ({
  phrase: [],
  validationFields: [],
  userValidationAttempt: [],
  generateRandomSeedPhrase: (length) => {
    set((state) => {
      const newSeedPhrase = generateSeedPhrase(length);
      state.seedPhrase.generate.phrase = newSeedPhrase;
      state.seedPhrase.generate.validationFields = validationFields(newSeedPhrase, 3);
      state.seedPhrase.generate.userValidationAttempt = [];
    });
  },
  cleanup: () => {
    set((state) => {
      state.seedPhrase.generate.phrase = [];
      state.seedPhrase.generate.validationFields = [];
      state.seedPhrase.generate.userValidationAttempt = [];
    });
  },
  updateAttempt: (attempt) => {
    set((state) => {
      const match = state.seedPhrase.generate.userValidationAttempt.find(
        (v) => v.index === attempt.index,
      );
      if (match) {
        match.word = attempt.word;
      } else {
        state.seedPhrase.generate.userValidationAttempt.push(attempt);
      }
    });
  },
  userAttemptCorrect: () => {
    const { userValidationAttempt, validationFields } = get().seedPhrase.generate;
    return (
      userValidationAttempt.length === validationFields.length &&
      userValidationAttempt.every((f) => {
        return validationFields.find((v) => v.index === f.index)?.word === f.word;
      })
    );
  },
});
