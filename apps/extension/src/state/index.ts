import { create, StateCreator } from 'zustand';
import { createWalletsSlice, WalletsSlice } from './wallets';
import { immer } from 'zustand/middleware/immer';
import { customPersist } from './persist';
import { createPasswordSlice, PasswordSlice } from './password';
import { createSeedPhraseSlice, SeedPhraseSlice } from './seed-phrase';
import { createNetworkSlice, NetworkSlice } from './network';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { LocalStorageState } from '@penumbra-zone/storage/chrome/types';
import { sessionExtStorage, SessionStorageState } from '@penumbra-zone/storage/chrome/session';
import { ExtensionStorage } from '@penumbra-zone/storage/chrome/base';
import { createTxApprovalSlice, TxApprovalSlice } from './tx-approval';
import { createOriginApprovalSlice, OriginApprovalSlice } from './origin-approval';
import { ConnectedSitesSlice, createConnectedSitesSlice } from './connected-sites';
import { createDefaultFrontendSlice, DefaultFrontendSlice } from './default-frontend';
import {createNumeraireSlice, NumeraireSlice} from "./numeraire";

export interface AllSlices {
  wallets: WalletsSlice;
  password: PasswordSlice;
  seedPhrase: SeedPhraseSlice;
  network: NetworkSlice;
  numeraire: NumeraireSlice;
  txApproval: TxApprovalSlice;
  originApproval: OriginApprovalSlice;
  connectedSites: ConnectedSitesSlice;
  defaultFrontend: DefaultFrontendSlice;
}

export type SliceCreator<SliceInterface> = StateCreator<
  AllSlices,
  [['zustand/immer', never]],
  [],
  SliceInterface
>;

export const initializeStore = (
  session: ExtensionStorage<SessionStorageState>,
  local: ExtensionStorage<LocalStorageState>,
) => {
  return immer((setState, getState: () => AllSlices, store) => ({
    wallets: createWalletsSlice(local)(setState, getState, store),
    password: createPasswordSlice(session, local)(setState, getState, store),
    seedPhrase: createSeedPhraseSlice(setState, getState, store),
    network: createNetworkSlice(local)(setState, getState, store),
    numeraire: createNumeraireSlice(local)(setState, getState,store),
    connectedSites: createConnectedSitesSlice(local)(setState, getState, store),
    txApproval: createTxApprovalSlice()(setState, getState, store),
    originApproval: createOriginApprovalSlice()(setState, getState, store),
    defaultFrontend: createDefaultFrontendSlice(local)(setState, getState, store),
  }));
};

// Wrap in logger() middleware if wanting to see store changes in console
export const useStore = create<AllSlices>()(
  customPersist(initializeStore(sessionExtStorage, localExtStorage)),
);
