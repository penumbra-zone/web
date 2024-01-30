import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test } from 'vitest';
import { AssetBalance } from '../fetchers/balances';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { stringToUint8Array } from '@penumbra-zone/types';
import { Selection } from './types';
import { assets } from '@penumbra-zone/constants';

describe('Swap Slice', () => {
  const assetBalance: AssetBalance = {
    denom: {
      display: 'xyz',
      exponent: 3,
    },
    assetId: new AssetId({ inner: stringToUint8Array('abcdefg') }),
    amount: new Amount(),
    usdcValue: 1234,
  };

  const selection: Selection = {
    address: 'address123',
    accountIndex: 4,
    asset: assetBalance,
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().swap.assetIn).toBeUndefined();
    expect(useStore.getState().swap.amount).toBe('');
    expect(useStore.getState().swap.assetOut).toBeUndefined();
    expect(useStore.getState().swap.txInProgress).toBeFalsy();
  });

  test('assetIn can be set', () => {
    expect(useStore.getState().swap.assetIn).toBeUndefined();
    useStore.getState().swap.setAssetIn(selection);
    expect(useStore.getState().swap.assetIn).toBe(selection);
  });

  test('assetOut can be set', () => {
    expect(useStore.getState().swap.assetOut).toBeUndefined();
    useStore.getState().swap.setAssetOut(assets[0]!);
    expect(useStore.getState().swap.assetOut).toBe(assets[0]!);
  });

  test('amount can be set', () => {
    expect(useStore.getState().swap.amount).toBe('');
    useStore.getState().swap.setAmount('22.44');
    expect(useStore.getState().swap.amount).toBe('22.44');
  });
});
