import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { mockLocalExtStorage, mockSessionExtStorage } from '../storage/mock';
import { ExtensionStorage } from '../storage/base';
import { LocalStorageState } from '../storage/local';
import { flushPromises } from '../utils/test-helpers';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

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
    const accountA = {
      label: 'Account #1',
      encryptedSeedPhrase: 'JPum4gUZn4KaLL9Y4xEIC8Tf+F1ZknmrBQLOlI4l72cd/bJWSz/EmVkr99g=',
      initializationVector: '+VzsTs4/j3wZct7oaDhHOg==',
      fullViewingKey: '1234',
    };
    await useStore.getState().wallets.addWallet(accountA);
    expect(useStore.getState().wallets.all.length).toBe(1);
    expect(useStore.getState().wallets.all.at(0)).toBe(accountA);

    await flushPromises();
    const accountsPt1 = await localStorage.get('wallets');
    expect(accountsPt1.length).toBe(1);
    expect(accountsPt1.at(0)).toBe(accountA);

    const accountB = {
      label: 'Account #2',
      encryptedSeedPhrase: 'JPum4gUZn4KaLL9Y4xEIC8Tf+F1ZknmrBQLOlI4l72cd/bJWSz/EmVkr99g=',
      initializationVector: '+VzsTs4/j3wZct7oaDhHOg==',
      fullViewingKey: '1234',
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
