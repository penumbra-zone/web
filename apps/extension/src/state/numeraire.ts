import { LocalStorageState } from '@penumbra-zone/storage/chrome/types';
import { ExtensionStorage } from '@penumbra-zone/storage/chrome/base';
import { AllSlices, SliceCreator } from '.';

export interface NumeraireSlice {
    numeraireAssetId: string | undefined;
    setNumeraireAssetId: (endpoint: string) => Promise<void>;
}

export const createNumeraireSlice =
    (local: ExtensionStorage<LocalStorageState>): SliceCreator<NumeraireSlice> =>
        set => {
            return {
                numeraireAssetId: undefined,
                setNumeraireAssetId: async (numeraireAssetId: string) => {
                    set(state => {
                        state.numeraire.numeraireAssetId = numeraireAssetId;
                    });

                    await local.set('numeraireAssetId', numeraireAssetId);
                },
            };
        };

export const numeraireSelector = (state: AllSlices) => state.numeraire;
