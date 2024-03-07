import { ExtensionStorage, LocalStorageState, OriginRecord } from '@penumbra-zone/storage';
import { AllSlices, SliceCreator } from '.';

import Map from '@penumbra-zone/polyfills/Map.groupBy';
import { UserAttitude } from '@penumbra-zone/types/src/user-attitude';

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
      const groupedSites = Map.groupBy(knownSites, ({ attitude }) => attitude);

      set(state => {
        state.connectedSites.knownSites = knownSites;
        state.connectedSites.approvedSites = groupedSites.get(UserAttitude.Approved) ?? [];
        state.connectedSites.deniedSites = groupedSites.get(UserAttitude.Denied) ?? [];
        state.connectedSites.ignoredSites = groupedSites.get(UserAttitude.Ignored) ?? [];
      });
    },

    setFilter: (search?: string) => {
      const knownSites = get().connectedSites.knownSites;
      const filter = search ?? get().connectedSites.filter;

      const filteredSites = Map.groupBy(
        knownSites.filter(site => !search || site.origin.includes(search)),
        ({ attitude }) => attitude,
      );

      set(state => {
        state.connectedSites.filter = filter;
        state.connectedSites.approvedSites = filteredSites.get(UserAttitude.Approved) ?? [];
        state.connectedSites.deniedSites = filteredSites.get(UserAttitude.Denied) ?? [];
        state.connectedSites.ignoredSites = filteredSites.get(UserAttitude.Ignored) ?? [];
      });
    },

    discardKnownSite: async (deletant: { origin: string }) => {
      const knownSites = await local.get('knownSites');
      const withoutDeletant = knownSites.filter(known => known.origin !== deletant.origin);
      await local.set('knownSites', withoutDeletant);
    },
  });

export const connectedSitesSelector = (state: AllSlices) => state.connectedSites;
