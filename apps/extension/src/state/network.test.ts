import { beforeEach, describe, expect, test } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '.';
import { LocalStorageState } from '../storage/types';
import { mockLocalExtStorage, mockSessionExtStorage } from '../storage/mock';
import { ExtensionStorage } from '../storage/base';

describe('Network Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), localStorage));
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().network.grpcEndpoint).toBeUndefined();
    expect(useStore.getState().network.fullSyncHeight).toBeUndefined();
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
