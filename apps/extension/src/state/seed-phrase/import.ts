import { AllSlices, SliceCreator } from '..';
import { SeedPhraseSlice } from '.';
import {
  isInWordList,
  SeedPhraseLength,
  validateSeedPhrase,
} from '@penumbra-zone/crypto-web/mnemonic';

export interface ImportFields {
  phrase: string[];
  update: (text: string, index: number) => void;
  setLength: (length: SeedPhraseLength) => void;
  wordIsValid: (word: string) => boolean;
  phraseIsValid: () => boolean;
}

export const createImport: SliceCreator<SeedPhraseSlice['import']> = (set, get) => ({
  phrase: [],
  update: (text, position) => {
    const words = text.trim().split(' ');

    // Extend phrase length if trying to paste in one that's longer
    if (words.length > get().seedPhrase.import.phrase.length) {
      get().seedPhrase.import.setLength(SeedPhraseLength.TWENTY_FOUR_WORDS);
    }

    // If attempting to add entire seed phrase, spread through the subsequent fields
    words.slice(0, get().seedPhrase.import.phrase.length - position).forEach((word, i) => {
      set(state => {
        state.seedPhrase.import.phrase[position + i] = word;
      });
    });
  },
  setLength: (length: SeedPhraseLength) => {
    const desiredLength = length === SeedPhraseLength.TWELVE_WORDS ? 12 : 24;
    const currLength = get().seedPhrase.import.phrase.length;

    if (currLength === desiredLength) return;
    if (currLength < desiredLength) {
      set(({ seedPhrase }) => {
        seedPhrase.import.phrase = seedPhrase.import.phrase.concat(
          new Array(desiredLength - currLength).fill(''),
        );
      });
    } else {
      set(({ seedPhrase }) => {
        seedPhrase.import.phrase = seedPhrase.import.phrase.slice(0, desiredLength);
      });
    }
  },
  wordIsValid: word => isInWordList(word),
  phraseIsValid: () => validateSeedPhrase(get().seedPhrase.import.phrase),
});

export const importSelector = (state: AllSlices) => state.seedPhrase.import;
