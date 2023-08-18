import { SliceCreator } from '../index';
import { createGenerate, GenerateFields } from './generate';
import { createImport, ImportFields } from './import';

export interface SeedPhraseSlice {
  generate: GenerateFields;
  import: ImportFields;
}

export const createSeedPhraseSlice: SliceCreator<SeedPhraseSlice> = (set, get, store) => ({
  generate: { ...createGenerate(set, get, store) },
  import: { ...createImport(set, get, store) },
});
