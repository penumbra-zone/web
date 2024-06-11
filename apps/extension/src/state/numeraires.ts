import { LocalStorageState } from '../storage/types';
import { ExtensionStorage } from '../storage/base';
import { AllSlices, SliceCreator } from '.';

export interface NumerairesSlice {
    numeraires: string [];
    setNumeraires: (numeraires: string []) => Promise<void>;
}

export const createNumerairesSlice =
    (local: ExtensionStorage<LocalStorageState>): SliceCreator<NumerairesSlice> =>
        set => {
            return {
                numeraires: [],
                setNumeraires: async (numeraires: string []) => {
                    set(state => {
                        state.numeraires.numeraires = numeraires;
                    });

                    await local.set('numeraires', numeraires);
                },
            };
        };

export const numerairesSelector = (state: AllSlices) => state.numeraires;
