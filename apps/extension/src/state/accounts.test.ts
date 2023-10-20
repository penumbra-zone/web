import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { webcrypto } from 'crypto';
import {
  ExtensionStorage,
  LocalStorageState,
  mockLocalExtStorage,
  mockSessionExtStorage,
  SessionStorageState,
} from '@penumbra-zone/storage';

vi.stubGlobal('crypto', webcrypto);
vi.mock('@penumbra-zone/wasm-ts', () => ({
  generateSpendKey: () => 'spend_key',
  getFullViewingKey: () => 'full_viewing_key',
}));

describe('Accounts Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let sessionStorage: ExtensionStorage<SessionStorageState>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    sessionStorage = mockSessionExtStorage();
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(sessionStorage, localStorage));
  });

  test('index starts at 0', () => {
    expect(useStore.getState().accounts.index).toBe(0);
  });

  test('can increment correctly', () => {
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    expect(useStore.getState().accounts.index).toBe(3);
  });

  test('can can decrement correctly', () => {
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.previous();
    useStore.getState().accounts.previous();
    expect(useStore.getState().accounts.index).toBe(3);
  });

  test('cannot go below zero', () => {
    useStore.getState().accounts.previous();
    useStore.getState().accounts.previous();
    useStore.getState().accounts.previous();
    useStore.getState().accounts.previous();
    expect(useStore.getState().accounts.index).toBe(0);
  });
});
