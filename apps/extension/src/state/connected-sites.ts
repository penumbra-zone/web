import { ExtensionStorage } from '@penumbra-zone/storage/chrome/base';
import { LocalStorageState, OriginRecord } from '@penumbra-zone/storage/chrome/types';
import { AllSlices, SliceCreator } from '.';

export interface ConnectedSitesSlice {
  filter?: string;
  setFilter: (search?: string) => void;
  knownSites: OriginRecord[];
  discardKnownSite: (originRecord: OriginRecord) => Promise<void>;
  frontendUrl?: string;
  setFrontendUrl: (frontendUrl: string) => void;
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

    setFrontendUrl: (frontendUrl: string) => {
      void local.set('frontendUrl', frontendUrl);
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
