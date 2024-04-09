import { ExtensionStorage } from '@penumbra-zone/storage/src/chrome/base';
import { LocalStorageState, OriginRecord } from '@penumbra-zone/storage/src/chrome/types';
import { AllSlices, SliceCreator } from '.';

import Map from '@penumbra-zone/polyfills/src/Map.groupBy';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';

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

export const sitesSelector = (state: AllSlices) => {
  const groupedSites = Map.groupBy(state.connectedSites.knownSites, ({ choice }) => choice);

  return {
    knownSites: state.connectedSites.knownSites,
    approvedSites: groupedSites.get(UserChoice.Approved) ?? [],
    deniedSites: groupedSites.get(UserChoice.Denied) ?? [],
    ignoredSites: groupedSites.get(UserChoice.Ignored) ?? [],
  };
};

export const noFilterMatchSelector = (state: AllSlices) => {
  const { filter } = state.connectedSites;
  if (!filter) return false;

  return !state.connectedSites.knownSites.some(site => site.origin.includes(filter));
};
