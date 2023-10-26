import { beforeEach, describe, expect, test, vi } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';
import {
  ExtensionStorage,
  LocalStorageState,
  mockLocalExtStorage,
  mockSessionExtStorage,
} from '@penumbra-zone/storage';

vi.mock('@penumbra-zone/wasm-ts', () => ({}));

describe('Connected Sites Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), localStorage));
  });

  test('the default is empty array', () => {
    expect(useStore.getState().connectedSites.all.length).toBe(0);
  });

  describe('addOrigin()', () => {
    test('origin can be set', async () => {
      const testOrigin = 'https://test';
      await useStore.getState().connectedSites.addOrigin(testOrigin);

      const connectedSitesLocal = await localStorage.get('connectedSites');
      expect(connectedSitesLocal.length).toBe(1);
      expect(connectedSitesLocal[0]).toBe(testOrigin);
      expect(useStore.getState().connectedSites.all.length).toBe(1);
      expect(useStore.getState().connectedSites.all[0]).toBe(testOrigin);
    });
  });

  describe('removeOrigin()', () => {
    test('origin can be remove', async () => {
      const testOrigin = 'https://test';
      await useStore.getState().connectedSites.addOrigin(testOrigin);

      await useStore.getState().connectedSites.removeOrigin(testOrigin);

      const connectedSitesLocal = await localStorage.get('connectedSites');
      expect(connectedSitesLocal.length).toBe(0);

      expect(useStore.getState().connectedSites.all.length).toBe(0);
    });
  });
});
