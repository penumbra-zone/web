import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockLocalExtStorage } from '../storage/mock';
import { ExtensionStorage } from '../storage/generic';
import { LocalStorageState } from '../storage/local';
import { flushPromises } from '../utils/test-helpers';

describe('Accounts Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockLocalExtStorage(), localStorage));
  });

  test('accounts start off empty', () => {
    expect(useStore.getState().accounts.all).toStrictEqual([]);
  });

  test('accounts can be added', async () => {
    const accountA = { label: 'Account #1', encryptedSeedPhrase: 'xyz' };
    useStore.getState().accounts.addAccount(accountA);
    expect(useStore.getState().accounts.all.length).toBe(1);
    expect(useStore.getState().accounts.all.at(0)).toBe(accountA);

    await flushPromises();
    const accountsPt1 = await localStorage.get('accounts');
    expect(accountsPt1.length).toBe(1);
    expect(accountsPt1.at(0)).toBe(accountA);

    const accountB = { label: 'Account #2', encryptedSeedPhrase: 'abc' };
    useStore.getState().accounts.addAccount(accountB);
    expect(useStore.getState().accounts.all.length).toBe(2);
    expect(useStore.getState().accounts.all.at(0)).toBe(accountB);
    expect(useStore.getState().accounts.all.at(1)).toBe(accountA);

    await flushPromises();
    const accountsPt2 = await localStorage.get('accounts');
    expect(accountsPt2.length).toBe(2);
    expect(accountsPt2.at(0)).toBe(accountB);
    expect(accountsPt2.at(1)).toBe(accountA);
  });
});
