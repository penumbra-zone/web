import { beforeEach, describe, expect, test } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';

describe('IBC Slice', () => {
  const asset = {
    base: 'wtest_usd',
    display: 'test_usd',
    description: '',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
      altBaseDenom: '',
      altBech32: '',
    },
    denomUnits: [
      {
        aliases: [],
        denom: 'test_usd',
        exponent: 18,
      },
      {
        aliases: [],
        denom: 'wtest_usd',
        exponent: 0,
      },
    ],
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore());
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().ibc.amount).toBe('');
    expect(useStore.getState().ibc.asset).toBeTruthy();
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
      useStore.getState().ibc.setAssetBalance(2);
      useStore.getState().ibc.setAmount('1');
      expect(useStore.getState().ibc.validationErrors.amount).toBeFalsy();
    });

    test('validate amount is truthy when the quantity exceeds the balance of the asset', () => {
      useStore.getState().ibc.setAsset(asset);
      useStore.getState().ibc.setAssetBalance(2);
      useStore.getState().ibc.setAmount('6');
      expect(useStore.getState().ibc.validationErrors.amount).toBeTruthy();
    });

    test('validate amount is falsy when an asset with a higher balance has changed', () => {
      const asset2 = {
        base: 'cube',
        display: 'cube',
        description: '',
        name: '',
        symbol: '',
        uri: '',
        uriHash: '',
        penumbraAssetId: {
          inner: '6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=',
          altBaseDenom: '',
          altBech32: '',
        },
        denomUnits: [
          {
            aliases: [],
            denom: 'cube',
            exponent: 0,
          },
        ],
      };

      useStore.getState().ibc.setAsset(asset);
      useStore.getState().ibc.setAssetBalance(1);
      useStore.getState().ibc.setAmount('2');
      expect(useStore.getState().ibc.validationErrors.amount).toBeTruthy();

      // change asset with higher balance
      useStore.getState().ibc.setAsset(asset2);
      useStore.getState().ibc.setAssetBalance(100);
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

  describe('setAssetBalance', () => {
    test('asset balance can be set', () => {
      useStore.getState().ibc.setAssetBalance(10);
      expect(useStore.getState().ibc.assetBalance).toBe(10);
    });
  });
});
