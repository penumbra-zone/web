import { beforeEach, describe, expect, test } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index.ts';
import { Chain } from '@penumbra-zone/types';

// TODO: Revisit tests when re-implementing ibc form

describe.skip('IBC Slice', () => {
  const asset = {
    inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
    altBaseDenom: '',
    altBech32: '',
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().ibc.amount).toBe('');
    expect(useStore.getState().ibc.asset).toBeTruthy();
    expect(useStore.getState().ibc.chain).toBeUndefined();
  });

  describe('setAmount', () => {
    test('amount can be set', () => {
      useStore.getState().ibc.setAmount('2');
      expect(useStore.getState().ibc.amount).toBe('2');
    });

    test.skip('validate amount is falsy', () => {
      useStore.getState().ibc.setAsset(asset);
      // useStore.getState().ibc.setAssetBalance(2);
      useStore.getState().ibc.setAmount('1');
      // expect(useStore.getState().ibc.validationErrors.amount).toBeFalsy();
    });

    test.skip('validate amount is truthy when the quantity exceeds the balance of the asset', () => {
      useStore.getState().ibc.setAsset(asset);
      // useStore.getState().ibc.setAssetBalance(2);
      useStore.getState().ibc.setAmount('6');
      // expect(useStore.getState().ibc.validationErrors.amount).toBeTruthy();
    });

    test.skip('validate amount is falsy when an asset with a higher balance has changed', () => {
      const asset2 = {
        inner: '6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=',
        altBaseDenom: '',
        altBech32: '',
      };

      useStore.getState().ibc.setAsset(asset);
      // useStore.getState().ibc.setAssetBalance(1);
      useStore.getState().ibc.setAmount('2');
      // expect(useStore.getState().ibc.validationErrors.amount).toBeTruthy();

      // change asset with higher balance
      useStore.getState().ibc.setAsset(asset2);
      // useStore.getState().ibc.setAssetBalance(100);
      // expect(useStore.getState().ibc.validationErrors.amount).toBeFalsy();
    });
  });

  describe('setAsset', () => {
    test.skip('asset can be set', () => {
      useStore.getState().ibc.setAsset(asset);
      // expect(useStore.getState().ibc.asset.penumbraAssetId).toStrictEqual(asset);
    });
  });

  describe('setChain', () => {
    test('chain can be set', () => {
      const chain = {
        displayName: 'Osmosis',
        chainId: 'osmosis-test-5',
        ibcChannel: '0',
        iconUrl: '/test.svg',
      } satisfies Chain;

      useStore.getState().ibc.setChain(chain);
      expect(useStore.getState().ibc.chain).toBe(chain);
    });
  });
});
