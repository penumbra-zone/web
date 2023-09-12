import { AllSlices, SliceCreator } from './index';
import { Wallet } from '../types/wallet';
import { ExtensionStorage } from '../storage/base';
import { LocalStorageState } from '../storage/local';

export interface WalletsSlice {
  all: Wallet[];
  addWallet: (wallet: Wallet) => Promise<void>;
}

export const createWalletsSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<WalletsSlice> =>
  set => {
    return {
      all: [],
      addWallet: async newAccount => {
        set(state => {
          state.wallets.all.unshift(newAccount);
        });

        const wallets = await local.get('wallets');
        await local.set('wallets', [newAccount, ...wallets]);
      },
    };
  };

export const walletsSelector = (state: AllSlices) => state.wallets;
