import { AllSlices, SliceCreator } from '..';
import { SeedPhraseSlice } from '.';
import {
  generateSeedPhrase,
  SeedPhraseLength,
  ValidationField,
  generateValidationFields,
} from '@penumbra-zone/crypto-web/src/mnemonic';

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
  generateRandomSeedPhrase: length => {
    set(({ seedPhrase: { generate } }) => {
      const newSeedPhrase = generateSeedPhrase(length);
      generate.phrase = newSeedPhrase;
      generate.validationFields = generateValidationFields(newSeedPhrase, 3);
      generate.userValidationAttempt = [];
    });
  },
  cleanup: () => {
    set(({ seedPhrase: { generate } }) => {
      generate.phrase = [];
      generate.validationFields = [];
      generate.userValidationAttempt = [];
    });
  },
  updateAttempt: attempt => {
    set(({ seedPhrase: { generate } }) => {
      const match = generate.userValidationAttempt.find(v => v.index === attempt.index);
      if (match) {
        match.word = attempt.word;
      } else {
        generate.userValidationAttempt.push(attempt);
      }
    });
  },
  userAttemptCorrect: () => {
    const { userValidationAttempt, validationFields } = get().seedPhrase.generate;
    return (
      userValidationAttempt.length === validationFields.length &&
      userValidationAttempt.every(f => {
        return validationFields.find(v => v.index === f.index)?.word === f.word;
      })
    );
  },
});

export const generateSelector = (state: AllSlices) => state.seedPhrase.generate;
