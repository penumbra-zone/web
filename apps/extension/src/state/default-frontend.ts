import { AllSlices, SliceCreator } from '.';
import { ExtensionStorage } from '@penumbra-zone/storage/chrome/base';
import { LocalStorageState } from '@penumbra-zone/storage/chrome/types';

export interface DefaultFrontendSlice {
  url?: string;
  setUrl: (url: string) => void;
}

export const createDefaultFrontendSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<DefaultFrontendSlice> =>
  set => ({
    url: undefined,
    setUrl: url => {
      set(state => {
        state.defaultFrontend.url = url;
      });

      void local.set('frontendUrl', url);
    },
  });

export const getDefaultFrontend = (state: AllSlices) => state.defaultFrontend.url;
