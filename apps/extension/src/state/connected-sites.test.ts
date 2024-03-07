import { beforeEach, describe, expect, test } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '.';
import {
  ExtensionStorage,
  LocalStorageState,
  OriginRecord,
  localDefaults,
  mockLocalExtStorage,
  mockSessionExtStorage,
} from '@penumbra-zone/storage';
import { UserAttitude } from '@penumbra-zone/types/src/user-attitude';

describe('Connected Sites Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), localStorage));
  });

  test('the default is empty', () => {
    expect(useStore.getState().connectedSites.filter).toBeUndefined();
    expect(useStore.getState().connectedSites.knownSites).toMatchObject([]);
    expect(useStore.getState().connectedSites.approvedSites).toMatchObject([]);
    expect(useStore.getState().connectedSites.deniedSites).toMatchObject([]);
    expect(useStore.getState().connectedSites.ignoredSites).toMatchObject([]);
  });

  describe('loadKnownSites', () => {
    beforeEach(async () => {
      await expect(useStore.getState().connectedSites.loadKnownSites()).resolves.not.toThrow();
    });

    test('known sites are loaded', () => {
      expect(useStore.getState().connectedSites.knownSites).toMatchObject(localDefaults.knownSites);
      expect(useStore.getState().connectedSites.approvedSites).toMatchObject(
        localDefaults.knownSites,
      );
    });

    describe('setFilter', () => {
      test('filter can be set', () => {
        const testUrl = 'https://test';
        useStore.getState().connectedSites.setFilter(testUrl);
        expect(useStore.getState().connectedSites.filter).toBe(testUrl);
      });

      test('setting filter matches properly', () => {
        const testUrl = localDefaults.knownSites[0]!.origin;
        useStore.getState().connectedSites.setFilter(testUrl);
        expect(useStore.getState().connectedSites.filter).toBe(testUrl);
        expect(useStore.getState().connectedSites.knownSites).toMatchObject(
          localDefaults.knownSites,
        );
        expect(useStore.getState().connectedSites.approvedSites).toMatchObject(
          localDefaults.knownSites,
        );
      });

      test('setting filter removes properly', () => {
        const testUrl = 'https://test';
        useStore.getState().connectedSites.setFilter(testUrl);
        expect(useStore.getState().connectedSites.filter).toBe(testUrl);
        expect(useStore.getState().connectedSites.knownSites).toMatchObject(
          localDefaults.knownSites,
        );
        expect(useStore.getState().connectedSites.approvedSites).toMatchObject([]);
      });
    });

    describe('discardKnownSite', () => {
      test('discarding known site removes it from storage', async () => {
        const deletant = localDefaults.knownSites[0]!;
        await expect(
          useStore.getState().connectedSites.discardKnownSite(deletant),
        ).resolves.not.toThrow();

        // no effect yet, we haven't reloaded
        expect(useStore.getState().connectedSites.knownSites).toMatchObject(
          localDefaults.knownSites,
        );

        await expect(useStore.getState().connectedSites.loadKnownSites()).resolves.not.toThrow();

        expect(useStore.getState().connectedSites.knownSites).toMatchObject([]);
      });

      test('discarding unknown site has no effect on storage', async () => {
        const deletant: OriginRecord = {
          origin: 'https://test',
          attitude: UserAttitude.Ignored,
          date: Date.now(),
        };

        await expect(
          useStore.getState().connectedSites.discardKnownSite(deletant),
        ).resolves.not.toThrow();

        await expect(useStore.getState().connectedSites.loadKnownSites()).resolves.not.toThrow();

        expect(useStore.getState().connectedSites.knownSites).toMatchObject(
          localDefaults.knownSites,
        );
      });
    });
  });
});
