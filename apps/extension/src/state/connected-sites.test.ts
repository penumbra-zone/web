import { beforeEach, describe, expect, test } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';
import {
  ExtensionStorage,
  LocalStorageState,
  mockLocalExtStorage,
  mockSessionExtStorage,
} from '@penumbra-zone/storage';

describe('Network Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), localStorage));
  });

  test('the default is empty array', () => {
    expect(useStore.getState().connectedSites.connectedSites).toBe([]);
  });
});
