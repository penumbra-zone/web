import { beforeEach, describe, expect, it } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '.';
import { LocalStorageState } from '../storage/types';
import { ExtensionStorage } from '../storage/base';
import { mockLocalExtStorage, mockSessionExtStorage } from '../storage/mock';

describe('Default Frontend Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), localStorage));
  });

  it('populates the local storage correctly', () => {
    expect(useStore.getState().defaultFrontend.url).toBeUndefined();
  });

  it('sets the value of default frontend correctly', async () => {
    const testUrl = 'https://example.com';
    useStore.getState().defaultFrontend.setUrl(testUrl);
    expect(useStore.getState().defaultFrontend.url).toBe(testUrl);

    const urlFromChromeStorage = await localStorage.get('frontendUrl');
    expect(urlFromChromeStorage).toBe(testUrl);
  });
});
