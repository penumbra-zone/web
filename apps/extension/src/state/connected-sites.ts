import { ExtensionStorage } from '@penumbra-zone/storage/src/chrome/base';
import { LocalStorageState, OriginRecord } from '@penumbra-zone/storage/src/chrome/types';
import { AllSlices, SliceCreator } from '.';

export interface ConnectedSitesSlice {
  filter?: string;
  setFilter: (search?: string) => void;
  knownSites: OriginRecord[];
  loadKnownSites: () => Promise<void>;
  discardKnownSite: (originRecord: OriginRecord) => Promise<void>;
}

export const createConnectedSitesSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<ConnectedSitesSlice> =>
  (set, get) => ({
    knownSites: [],

    filter: undefined,
    setFilter: (search?: string) => {
      set(state => {
        state.connectedSites.filter = search;
      });
    },

    loadKnownSites: async () => {
      const knownSites = await local.get('knownSites');

      set(state => {
        state.connectedSites.knownSites = knownSites;
      });
    },

    discardKnownSite: async (siteToDelete: { origin: string }) => {
      const knownSites = get().connectedSites.knownSites;
      const withoutSiteToDelete = knownSites.filter(known => known.origin !== siteToDelete.origin);
      await local.set('knownSites', withoutSiteToDelete);
    },
  });

export const allSitesFilteredOutSelector = (state: AllSlices) => {
  const filter = state.connectedSites.filter;
  if (!filter) return false;

  return !state.connectedSites.knownSites.some(site => site.origin.includes(filter));
};
