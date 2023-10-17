import { beforeEach, describe, expect, test, vi } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from './index';
import {
  ExtensionStorage,
  LocalStorageState,
  mockLocalExtStorage,
  mockSessionExtStorage,
} from 'penumbra-storage';

vi.mock('penumbra-wasm-ts', () => ({}));

describe('Network Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), localStorage));
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().network.grpcEndpoint).toBeUndefined();
    expect(useStore.getState().network.lastBlockSynced).toBe(0);
  });

  describe('setGRPCEndpoint', () => {
    test('grpc endpoint can be set', async () => {
      const testUrl = 'https://test';
      await useStore.getState().network.setGRPCEndpoint(testUrl);

      expect(useStore.getState().network.grpcEndpoint).toBe(testUrl);
      const urlFromChromeStorage = await localStorage.get('grpcEndpoint');
      expect(urlFromChromeStorage).toBe(testUrl);
    });
  });
});
