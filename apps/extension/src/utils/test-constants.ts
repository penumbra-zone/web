import { LocalStorageState } from '@penumbra-zone/storage/chrome/types';
import { UserChoice } from '@penumbra-zone/types/user-choice';

export const EXAMPLE_MINIFRONT_URL = 'https://app.example.com';

export const localTestDefaults: LocalStorageState = {
  wallets: [],
  fullSyncHeight: undefined,
  knownSites: [{ origin: EXAMPLE_MINIFRONT_URL, choice: UserChoice.Approved, date: Date.now() }],
  frontendUrl: EXAMPLE_MINIFRONT_URL,
};
