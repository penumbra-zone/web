import { beforeEach, describe, expect, test } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';

describe('IBC Slice', () => {
  const asset = {
    name: 'BNB 1',
    icon: '/test-asset-icon-2.svg',
    balance: 1,
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore());
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().ibc.amount).toBe('');
    expect(useStore.getState().ibc.asset).toBeUndefined();
    expect(useStore.getState().ibc.chain).toBeUndefined();
    expect(useStore.getState().ibc.validationErrors.amount).toBeFalsy();
  });

  describe('setAmount', () => {
    test('amount can be set', () => {
      useStore.getState().ibc.setAmount('2');
      expect(useStore.getState().ibc.amount).toBe('2');
    });

    test('validate amount is falsy', () => {
      useStore.getState().ibc.setAsset(asset);
      useStore.getState().ibc.setAmount('1');
      expect(useStore.getState().ibc.amount).toBe('1');
      expect(useStore.getState().ibc.validationErrors.amount).toBeFalsy();
    });

    test('validate amount is truthy when the quantity exceeds the balance of the asset', () => {
      useStore.getState().ibc.setAsset(asset);
      useStore.getState().ibc.setAmount('2');
      expect(useStore.getState().ibc.amount).toBe('2');
      expect(useStore.getState().ibc.validationErrors.amount).toBeTruthy();
    });

    test('validate amount is falsy when an asset with a higher balance has changed', () => {
      const asset2 = {
        name: 'BNB 1',
        icon: '/test-asset-icon-2.svg',
        balance: 2,
      };

      useStore.getState().ibc.setAsset(asset);
      useStore.getState().ibc.setAmount('2');
      expect(useStore.getState().ibc.amount).toBe('2');
      expect(useStore.getState().ibc.validationErrors.amount).toBeTruthy();

      // change asset with higher balance
      useStore.getState().ibc.setAsset(asset2);
      expect(useStore.getState().ibc.amount).toBe('2');
      expect(useStore.getState().ibc.validationErrors.amount).toBeFalsy();
    });
  });

  describe('setAsset', () => {
    test('asset can be set', () => {
      useStore.getState().ibc.setAsset(asset);
      expect(useStore.getState().ibc.asset).toBe(asset);
    });
  });

  describe('setChain', () => {
    test('chain can be set', () => {
      const chain = {
        name: 'Osmosis 1',
        icon: '/test-chain-icon.png',
      };

      useStore.getState().ibc.setChain(chain);
      expect(useStore.getState().ibc.chain).toBe(chain);
    });
  });
});
