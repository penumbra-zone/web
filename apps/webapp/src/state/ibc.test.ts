import { beforeEach, describe, expect, test } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index.ts';
import { Chain } from '@penumbra-zone/types';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { sendValidationErrors } from './send.ts';
import { Selection } from './types.ts';

// TODO: Revisit tests when re-implementing ibc form

describe.skip('IBC Slice', () => {
  const selectionExample = {
    asset: {
      amount: new Amount({
        lo: 0n,
        hi: 0n,
      }),
      denomMetadata: new DenomMetadata({ display: 'test_usd', denomUnits: [{ exponent: 18 }] }),
      usdcValue: 0,
      assetId: new AssetId().fromJson({ inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=' }),
    },
    address:
      'penumbra1e8k5c3ds484dxvapeamwveh5khqv4jsvyvaf5wwxaaccgfghm229qw03pcar3ryy8smptevstycch0qk3uurrgkvtjpny3cu3rjd0agawqtlz6erev28a6sg69u7cxy0t02nd1',
    accountIndex: 0,
  } satisfies Selection;
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().ibc.amount).toBe('');
    expect(useStore.getState().ibc.selection).toBeUndefined();
    expect(useStore.getState().ibc.chain).toBeUndefined();
  });

  describe('setAmount', () => {
    test('amount can be set', () => {
      useStore.getState().ibc.setAmount('2');
      expect(useStore.getState().ibc.amount).toBe('2');
    });

    test('validate high enough amount validates', () => {
      const assetBalance = new Amount({ hi: 1n });
      useStore.getState().send.setSelection({
        ...selectionExample,
        asset: { ...selectionExample.asset, amount: assetBalance },
      });
      useStore.getState().send.setAmount('1');
      const { selection, amount } = useStore.getState().send;

      const { amountErr } = sendValidationErrors(selection?.asset, amount, 'xyz');
      expect(amountErr).toBeFalsy();
    });

    test('validate error when too low the balance of the asset', () => {
      const assetBalance = new Amount({ lo: 2n });
      useStore.getState().send.setSelection({
        ...selectionExample,
        asset: { ...selectionExample.asset, amount: assetBalance },
      });
      useStore.getState().send.setAmount('6');
      const { selection, amount } = useStore.getState().send;
      const { amountErr } = sendValidationErrors(selection?.asset, amount, 'xyz');
      expect(amountErr).toBeTruthy();
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

  describe('setSelection', () => {
    test('asset and account can be set', () => {
      useStore.getState().send.setSelection(selectionExample);
      expect(useStore.getState().send.selection).toStrictEqual(selectionExample);
    });
  });
});
