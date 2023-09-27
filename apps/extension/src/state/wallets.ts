import { AllSlices, SliceCreator } from './index';
import { Wallet, WalletCreate } from '../types/wallet';
import { ExtensionStorage } from '../storage/base';
import { LocalStorageState } from '../storage/local';
import { generateSpendKey, getFullViewingKey } from 'penumbra-wasm-ts';

export interface WalletsSlice {
  all: Wallet[];
  addWallet: (toAdd: WalletCreate) => Promise<Wallet>;
}

export const createWalletsSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<WalletsSlice> =>
  (set, get) => {
    return {
      all: [],
      addWallet: async ({ label, seedPhrase }) => {
        const seedPhraseStr = seedPhrase.join(' ');
        const spendKey = generateSpendKey(seedPhraseStr);
        const fullViewingKey = getFullViewingKey(spendKey);

        const passwordKey = get().password.key;
        if (!passwordKey) throw new Error('Password Key not in storage');

        const encryptedSeedPhrase = await passwordKey.seal(seedPhraseStr);

        const accountGroup = ''; // TODO: Should derive this from the key when implemented in wasm crate
        const newWallet = new Wallet(label, accountGroup, fullViewingKey, encryptedSeedPhrase);

        set(state => {
          state.wallets.all.unshift(newWallet);
        });

        const wallets = await local.get('wallets');
        await local.set('wallets', [newWallet.toJson(), ...wallets]);
        return newWallet;
      },
    };
  };

export const walletsSelector = (state: AllSlices) => state.wallets;
