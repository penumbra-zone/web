import { AllSlices, SliceCreator } from './index';
import { generateSpendKey, getFullViewingKey, getWalletId } from 'penumbra-wasm-ts';
import { Key } from 'penumbra-crypto-ts';
import { ExtensionStorage, LocalStorageState } from 'penumbra-storage';
import { Wallet, WalletCreate } from 'penumbra-types';

export interface WalletsSlice {
  all: Wallet[];
  addWallet: (toAdd: WalletCreate) => Promise<Wallet>;
  getSeedPhrase: () => Promise<string[]>;
  getSpendKey: () => Promise<string>;
  getFullViewingKey: () => Promise<string>;
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

        const key = await Key.fromJson(passwordKey);
        const encryptedSeedPhrase = await key.seal(seedPhraseStr);
        const walletId = getWalletId(fullViewingKey);
        const newWallet = new Wallet(label, walletId, fullViewingKey, { encryptedSeedPhrase });

        set(state => {
          state.wallets.all.unshift(newWallet);
        });

        const wallets = await local.get('wallets');
        await local.set('wallets', [newWallet.toJson(), ...wallets]);
        return newWallet;
      },
      getSeedPhrase: async () => {
        const passwordKey = get().password.key;
        const key = await Key.fromJson(passwordKey!);

        const encryptedSeedPhrase = get().wallets.all[0]?.custody.encryptedSeedPhrase;
        const unsealeSeedPhrase = await key.unseal(encryptedSeedPhrase!);

        return unsealeSeedPhrase?.split(' ') ?? [];
      },
      getSpendKey: async () => {
        const seedPhrase = (await get().wallets.getSeedPhrase()).join(' ');

        return generateSpendKey(seedPhrase);
      },
      getFullViewingKey: async () => {
        const seedPhrase = (await get().wallets.getSeedPhrase()).join(' ');
        const spendKey = generateSpendKey(seedPhrase);

        return getFullViewingKey(spendKey);
      },
    };
  };

export const walletsSelector = (state: AllSlices) => state.wallets;
export const getActiveWallet = (state: AllSlices) => state.wallets.all[0];
