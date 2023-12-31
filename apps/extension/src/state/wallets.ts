import { AllSlices, SliceCreator } from './index';
import {
  generateSpendKey,
  getAddressByIndex,
  getEphemeralByIndex,
  getFullViewingKey,
  getShortAddressByIndex,
  getWalletId,
} from '@penumbra-zone/wasm-ts';
import { Key } from '@penumbra-zone/crypto-web';
import { ExtensionStorage, LocalStorageState } from '@penumbra-zone/storage';
import { Wallet, WalletCreate, bech32Address } from '@penumbra-zone/types';

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
        if (!passwordKey) throw new Error('no password set');

        const key = await Key.fromJson(passwordKey);
        const activeWallet = getActiveWallet(get());
        if (!activeWallet) throw new Error('no wallet set');

        const decryptedSeedPhrase = await key.unseal(activeWallet.custody.encryptedSeedPhrase);
        if (!decryptedSeedPhrase) throw new Error('Unable to decrypt seed phrase with password');

        return decryptedSeedPhrase.split(' ');
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

export const accountAddrSelector = (state: AllSlices) => (index: number, ephemeral: boolean) => {
  const active = getActiveWallet(state);
  if (!active) return;

  const addr = ephemeral
    ? getEphemeralByIndex(active.fullViewingKey, index)
    : getAddressByIndex(active.fullViewingKey, index);
  const bech32Addr = bech32Address(addr);

  return {
    address: bech32Addr,
    preview: ephemeral
      ? bech32Addr.slice(0, 33) + '…'
      : getShortAddressByIndex(active.fullViewingKey, index),
    index,
  };
};
