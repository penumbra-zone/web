import { LocalStorageState } from '../storage/types';
import { ExtensionStorage } from '../storage/base';
import { AllSlices, SliceCreator } from '.';
import type { Stringified } from '@penumbra-zone/types/jsonified';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export interface NumerairesSlice {
  selectedNumeraires: Stringified<AssetId>[];
  addNumeraire: (numeraire: Stringified<AssetId>) => Promise<void>;
}

export const createNumerairesSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<NumerairesSlice> =>
  set => {
    return {
      selectedNumeraires: [],
      addNumeraire: async (numeraire: Stringified<AssetId>) => {
        set(state => {
          state.numeraires.selectedNumeraires.push(numeraire);
          void local.set('numeraires', state.numeraires.selectedNumeraires);
        });
      },
    };
  };

export const numerairesSelector = (state: AllSlices) => state.numeraires;
