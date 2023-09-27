import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockLocalExtStorage, mockSessionExtStorage } from '../storage/mock';
import { ExtensionStorage } from '../storage/base';
import { LocalStorageState } from '../storage/local';
import { flushPromises } from '../utils/test-helpers';
import { WalletCreate } from '../types/wallet';

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

  test('accounts can be added', async () => {
    const accountA: WalletCreate = {
      label: 'Account #1',
      seedPhrase: ['apple', 'banana', 'orange'],
    };
    await useStore.getState().wallets.addWallet(accountA);
    expect(useStore.getState().wallets.all.length).toBe(1);
    expect(useStore.getState().wallets.all.at(0)).toBe(accountA);

    await flushPromises();
    const accountsPt1 = await localStorage.get('wallets');
    expect(accountsPt1.length).toBe(1);
    expect(accountsPt1.at(0)).toBe(accountA);

    const accountB: WalletCreate = {
      label: 'Account #2',
      seedPhrase: ['pear', 'grape', 'cashew'],
    };
    await useStore.getState().wallets.addWallet(accountB);
    expect(useStore.getState().wallets.all.length).toBe(2);
    expect(useStore.getState().wallets.all.at(0)).toBe(accountB);
    expect(useStore.getState().wallets.all.at(1)).toBe(accountA);

    await flushPromises();
    const accountsPt2 = await localStorage.get('wallets');
    expect(accountsPt2.length).toBe(2);
    expect(accountsPt2.at(0)).toBe(accountB);
    expect(accountsPt2.at(1)).toBe(accountA);
  });
});
