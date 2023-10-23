import { AllSlices, SliceCreator } from '.';
import { ExtensionStorage, LocalStorageState } from '@penumbra-zone/storage';

export interface ConnectedSitesSlice {
  connectedSites: string[];
  addOrigin: (origin: string) => Promise<void>;
  removeOrigin: (origin: string) => Promise<void>;
}

export const createConnectedSitesSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<ConnectedSitesSlice> =>
  set => {
    return {
      connectedSites: [],
      addOrigin: async origin => {
        set(state => {
          state.connectedSites.connectedSites = [origin, ...state.connectedSites.connectedSites];
        });

        const connectedSites = await local.get('connectedSites');
        await local.set('connectedSites', [origin, ...connectedSites]);
      },
      removeOrigin: async origin => {
        set(state => {
          state.connectedSites.connectedSites = state.connectedSites.connectedSites.filter(
            i => i !== origin,
          );
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
