import { AllSlices, SliceCreator } from '.';
import { ExtensionStorage, LocalStorageState } from '@penumbra-zone/storage';

export interface ConnectedSitesSlice {
  all: string[];
  addOrigin: (origin: string) => Promise<void>;
  removeOrigin: (origin: string) => Promise<void>;
}

export const createConnectedSitesSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<ConnectedSitesSlice> =>
  set => {
    return {
      all: [],
      addOrigin: async origin => {
        set(state => {
          state.connectedSites.all = [origin, ...state.connectedSites.all];
        });

        const connectedSites = await local.get('connectedSites');
        await local.set('connectedSites', [origin, ...connectedSites]);
      },
      removeOrigin: async origin => {
        set(state => {
          state.connectedSites.all = state.connectedSites.all.filter(i => i !== origin);
        });

        const connectedSites = await local.get('connectedSites');
        await local.set(
          'connectedSites',
          connectedSites.filter(i => i !== origin),
        );
      },
    };
  };

export const connectedSitesSelector = (state: AllSlices) => state.connectedSites;
