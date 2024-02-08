import { beforeEach, describe, expect, test } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index.ts';
import { bech32ToUint8Array, Chain } from '@penumbra-zone/types';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { sendValidationErrors } from './send.ts';
import { AssetBalance } from '../fetchers/balances';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { produce } from 'immer';

// TODO: Revisit tests when re-implementing ibc form

describe.skip('IBC Slice', () => {
  const selectionExample = {
    value: new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: new Amount({
            lo: 0n,
            hi: 0n,
          }),
          metadata: new Metadata({ display: 'test_usd', denomUnits: [{ exponent: 18 }] }),
        },
      },
    }),
    address: new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address: {
            inner: bech32ToUint8Array(
              'penumbra1e8k5cyds484dxvapeamwveh5khqv4jsvyvaf5wwxaaccgfghm229qw03pcar3ryy8smptevstycch0qk3uu0rgkvtjpxy3cu3rjd0agawqtlz6erev28a6sg69u7cxy0t02nd4',
            ),
          },
        },
      },
    }),
    usdcValue: 0,
  } satisfies AssetBalance;

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
      const state = produce(selectionExample, draft => {
        draft.value.valueView.value!.amount = assetBalance;
      });
      useStore.getState().send.setSelection(state);
      useStore.getState().send.setAmount('1');
      const { selection, amount } = useStore.getState().send;

      const { amountErr } = sendValidationErrors(selection, amount, 'xyz');
      expect(amountErr).toBeFalsy();
    });

    test('validate error when too low the balance of the asset', () => {
      const assetBalance = new Amount({ lo: 2n });
      const state = produce(selectionExample, draft => {
        draft.value.valueView.value!.amount = assetBalance;
      });
      useStore.getState().send.setSelection(state);
      useStore.getState().send.setAmount('6');
      const { selection, amount } = useStore.getState().send;
      const { amountErr } = sendValidationErrors(selection, amount, 'xyz');
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
