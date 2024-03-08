import { ExtensionStorage, LocalStorageState, OriginRecord } from '@penumbra-zone/storage';
import { AllSlices, SliceCreator } from '.';

import Map from '@penumbra-zone/polyfills/Map.groupBy';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';

export interface ConnectedSitesSlice {
  filter?: string;
  knownSites: OriginRecord[];
  approvedSites: OriginRecord[];
  deniedSites: OriginRecord[];
  ignoredSites: OriginRecord[];
  loadKnownSites: () => Promise<void>;
  setFilter: (search?: string) => void;
  discardKnownSite: (originRecord: OriginRecord) => Promise<void>;
}

export const createConnectedSitesSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<ConnectedSitesSlice> =>
  (set, get) => ({
    filter: undefined,
    knownSites: [],
    approvedSites: [],
    deniedSites: [],
    ignoredSites: [],

    loadKnownSites: async () => {
      const knownSites = await local.get('knownSites');
      const groupedSites = Map.groupBy(knownSites, ({ choice }) => choice);

      set(state => {
        state.connectedSites.knownSites = knownSites;
        state.connectedSites.approvedSites = groupedSites.get(UserChoice.Approved) ?? [];
        state.connectedSites.deniedSites = groupedSites.get(UserChoice.Denied) ?? [];
        state.connectedSites.ignoredSites = groupedSites.get(UserChoice.Ignored) ?? [];
      });
    },

    setFilter: (search?: string) => {
      const knownSites = get().connectedSites.knownSites;
      const filter = search ?? get().connectedSites.filter;

      const filteredSites = Map.groupBy(
        knownSites.filter(site => !search || site.origin.includes(search)),
        ({ choice }) => choice,
      );

      set(state => {
        state.connectedSites.filter = filter;
        state.connectedSites.approvedSites = filteredSites.get(UserChoice.Approved) ?? [];
        state.connectedSites.deniedSites = filteredSites.get(UserChoice.Denied) ?? [];
        state.connectedSites.ignoredSites = filteredSites.get(UserChoice.Ignored) ?? [];
      });
    },

    discardKnownSite: async (deletant: { origin: string }) => {
      const existingFilter = get().connectedSites.filter;
      const knownSites = await local.get('knownSites');
      const withoutDeletant = knownSites.filter(known => known.origin !== deletant.origin);
      await local.set('knownSites', withoutDeletant);
      await get().connectedSites.loadKnownSites();
      get().connectedSites.setFilter(existingFilter);
    },
  });

export const connectedSitesSelector = (state: AllSlices) => state.connectedSites;
