import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { webcrypto } from 'crypto';
import {
  ExtensionStorage,
  LocalStorageState,
  mockLocalExtStorage,
  mockSessionExtStorage,
} from 'penumbra-storage';
import { WalletCreate } from 'penumbra-types';

vi.stubGlobal('crypto', webcrypto);
vi.mock('penumbra-wasm-ts', () => ({
  generateSpendKey: () => 'spend_key',
  getFullViewingKey: () => 'full_viewing_key',
  getWalletId: () => 'wallet_id',
}));

describe('Accounts Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), localStorage));
  });

  test('accounts start off empty', () => {
    expect(useStore.getState().wallets.all).toStrictEqual([]);
  });

  describe('addWallet()', () => {
    test('throws if no password in storage', async () => {
      const accountA: WalletCreate = {
        label: 'Account #1',
        seedPhrase: ['apple', 'banana', 'orange'],
      };
      await expect(useStore.getState().wallets.addWallet(accountA)).rejects.toThrow();
    });

    test('accounts can be added', async () => {
      await useStore.getState().password.setPassword('user_password_123');
      const accountA: WalletCreate = {
        label: 'Account #1',
        seedPhrase: ['apple', 'banana', 'orange'],
      };
      await useStore.getState().wallets.addWallet(accountA);
      expect(useStore.getState().wallets.all.length).toBe(1);
      expect(useStore.getState().wallets.all.at(0)!.label).toBe(accountA.label);

      // Test in long term storage
      const accountsPt1 = await localStorage.get('wallets');
      expect(accountsPt1.length).toBe(1);
      expect(accountsPt1.at(0)!.label).toBe(accountA.label);

      const accountB: WalletCreate = {
        label: 'Account #2',
        seedPhrase: ['pear', 'grape', 'cashew'],
      };
      await useStore.getState().wallets.addWallet(accountB);
      expect(useStore.getState().wallets.all.length).toBe(2);
      expect(useStore.getState().wallets.all.at(0)!.label).toBe(accountB.label);
      expect(useStore.getState().wallets.all.at(1)!.label).toBe(accountA.label);

      // Test in long term storage
      const accountsPt2 = await localStorage.get('wallets');
      expect(accountsPt2.length).toBe(2);
      expect(accountsPt2.at(0)!.label).toBe(accountB.label);
      expect(accountsPt2.at(1)!.label).toBe(accountA.label);
    });
  });

  describe('getSeedPhrase()', () => {
    test('seed phrase can be return', async () => {
      await useStore.getState().password.setPassword('user_password_123');
      const initialSeedPhrase = ['apple', 'banana', 'orange'];
      const accountA: WalletCreate = {
        label: 'Account #1',
        seedPhrase: initialSeedPhrase,
      };
      await useStore.getState().wallets.addWallet(accountA);
      expect(useStore.getState().wallets.all.length).toBe(1);
      expect(useStore.getState().wallets.all.at(0)!.label).toBe(accountA.label);

      const seedPhraseFromKey = await useStore.getState().wallets.getSeedPhrase();
      expect(seedPhraseFromKey).toStrictEqual(initialSeedPhrase);
    });

    test('seed phrase can be return after relogin', async () => {
      const password = 'user_password_123'
      await useStore.getState().password.setPassword(password);
      const initialSeedPhrase = ['apple', 'banana', 'orange'];
      const accountA: WalletCreate = {
        label: 'Account #1',
        seedPhrase: initialSeedPhrase,
      };
      await useStore.getState().wallets.addWallet(accountA);
      expect(useStore.getState().wallets.all.length).toBe(1);
      expect(useStore.getState().wallets.all.at(0)!.label).toBe(accountA.label);

      const seedPhraseFromKey = await useStore.getState().wallets.getSeedPhrase();
      expect(seedPhraseFromKey).toStrictEqual(initialSeedPhrase);

      useStore.getState().password.clearSessionPassword();
      await useStore.getState().password.setSessionPassword(password);
      const seedPhraseFromKeyAfterRelogin = await useStore.getState().wallets.getSeedPhrase();
      expect(seedPhraseFromKeyAfterRelogin).toStrictEqual(initialSeedPhrase);
    });
  });
});
