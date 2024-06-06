import { SliceCreator } from '.';
import { ExtensionStorage } from '@penumbra-zone/storage/chrome/base';
import { LocalStorageState } from '@penumbra-zone/storage/chrome/types';

export interface DefaultFrontendSlice {
  url?: string;
  setUrl: (url: string) => Promise<void>;
}

export const createDefaultFrontendSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<DefaultFrontendSlice> =>
  set => ({
    url: undefined,
    setUrl: async url => {
      // Stored in memory (do we need this? given in persist.ts it is syncing there)
      // set(state => {
      //   state.defaultFrontend.url = url;
      // });

      // Stores in chrome.storage.local here
      await local.set('frontendUrl', url);
    },
  });
