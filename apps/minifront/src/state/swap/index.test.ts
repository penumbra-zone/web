import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '..';
import { beforeEach, describe, expect, it, test } from 'vitest';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';

describe('Swap Slice', () => {
  const selectionExample = new BalancesResponse({
    balanceView: new ValueView({
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
    accountAddress: new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address: addressFromBech32m(
            'penumbra1e8k5cyds484dxvapeamwveh5khqv4jsvyvaf5wwxaaccgfghm229qw03pcar3ryy8smptevstycch0qk3uu0rgkvtjpxy3cu3rjd0agawqtlz6erev28a6sg69u7cxy0t02nd4',
          ),
        },
      },
    }),
  });

  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let registryAssets: Metadata[];

  beforeEach(() => {
    registryAssets = [];
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  test('the defaults are correct', () => {
    expect(useStore.getState().swap.amount).toBe('');
    expect(useStore.getState().swap.assetIn).toBeUndefined();
    expect(useStore.getState().swap.assetOut).toBeUndefined();
    expect(useStore.getState().swap.swappableAssets).toEqual(
      expect.objectContaining({ data: undefined, error: undefined, loading: false }),
    );
    expect(useStore.getState().swap.balancesResponses).toEqual(
      expect.objectContaining({ data: undefined, error: undefined, loading: false }),
    );
    expect(useStore.getState().swap.duration).toBe('instant');
    expect(useStore.getState().swap.txInProgress).toBe(false);
  });

  test('assetIn can be set', () => {
    expect(useStore.getState().swap.assetIn).toBeUndefined();
    useStore.getState().swap.setAssetIn(selectionExample);
    expect(useStore.getState().swap.assetIn).toBe(selectionExample);
  });

  test('assetOut can be set', () => {
    expect(useStore.getState().swap.assetOut).toBeUndefined();
    useStore.getState().swap.setAssetOut(registryAssets[0]);
    expect(useStore.getState().swap.assetOut).toBe(registryAssets[0]);
  });

  test('amount can be set', () => {
    expect(useStore.getState().swap.amount).toBe('');
    useStore.getState().swap.setAmount('22.44');
    expect(useStore.getState().swap.amount).toBe('22.44');
  });

  describe('setAssetIn()', () => {
    it('clears the simulation results', () => {
      expect(useStore.getState().swap.instantSwap.simulateSwapResult).toBeUndefined();
      useStore.setState(state => {
        state.swap.instantSwap.simulateSwapResult = {
          output: new ValueView(),
          unfilled: new ValueView(),
          priceImpact: undefined,
          metadataByAssetId: {},
        };
        return state;
      });
      expect(useStore.getState().swap.instantSwap.simulateSwapResult).toBeDefined();
      useStore.getState().swap.setAssetIn(new BalancesResponse());
      expect(useStore.getState().swap.instantSwap.simulateSwapResult).toBeUndefined();
    });

    describe('when the new assetIn is the same asset as assetOut', () => {
      it('changes the assetOut to the next available asset', () => {
        const metadata1 = new Metadata({ penumbraAssetId: { inner: new Uint8Array([1]) } });
        const metadata2 = new Metadata({ penumbraAssetId: { inner: new Uint8Array([2]) } });

        const balancesResponseWithMetadata1 = new BalancesResponse({
          balanceView: { valueView: { case: 'knownAssetId', value: { metadata: metadata1 } } },
        });
        const balancesResponseWithMetadata2 = new BalancesResponse({
          balanceView: { valueView: { case: 'knownAssetId', value: { metadata: metadata2 } } },
        });

        useStore.setState(state => {
          state.swap.swappableAssets.data = [metadata1, metadata2];
          state.swap.balancesResponses.data = [
            balancesResponseWithMetadata1,
            balancesResponseWithMetadata2,
          ];
          state.swap.assetIn = balancesResponseWithMetadata1;
          state.swap.assetOut = metadata2;
          return state;
        });

        useStore.getState().swap.setAssetIn(balancesResponseWithMetadata2);

        expect(useStore.getState().swap.assetOut).toEqual(metadata1);
      });
    });
  });

  describe('setAssetOut', () => {
    it('clears the simulation results', () => {
      expect(useStore.getState().swap.instantSwap.simulateSwapResult).toBeUndefined();
      useStore.setState(state => {
        state.swap.instantSwap.simulateSwapResult = {
          output: new ValueView(),
          unfilled: new ValueView(),
          priceImpact: undefined,
          metadataByAssetId: {},
        };
        return state;
      });
      expect(useStore.getState().swap.instantSwap.simulateSwapResult).toBeDefined();
      useStore.getState().swap.setAssetOut({} as Metadata);
      expect(useStore.getState().swap.instantSwap.simulateSwapResult).toBeUndefined();
    });

    describe('when the new assetOut is the same asset as assetIn', () => {
      it('changes the assetIn to the next available asset', () => {
        const metadata1 = new Metadata({ penumbraAssetId: { inner: new Uint8Array([1]) } });
        const metadata2 = new Metadata({ penumbraAssetId: { inner: new Uint8Array([2]) } });

        const balancesResponseWithMetadata1 = new BalancesResponse({
          balanceView: { valueView: { case: 'knownAssetId', value: { metadata: metadata1 } } },
        });
        const balancesResponseWithMetadata2 = new BalancesResponse({
          balanceView: { valueView: { case: 'knownAssetId', value: { metadata: metadata2 } } },
        });

        useStore.setState(state => {
          state.swap.swappableAssets.data = [metadata1, metadata2];
          state.swap.balancesResponses.data = [
            balancesResponseWithMetadata1,
            balancesResponseWithMetadata2,
          ];
          state.swap.assetIn = balancesResponseWithMetadata1;
          state.swap.assetOut = metadata2;
          return state;
        });

        useStore.getState().swap.setAssetOut(metadata2);

        expect(useStore.getState().swap.assetIn).toEqual(balancesResponseWithMetadata1);
      });
    });
  });

  test('changing amount clears simulation', () => {
    expect(useStore.getState().swap.instantSwap.simulateSwapResult).toBeUndefined();
    useStore.setState(state => {
      state.swap.instantSwap.simulateSwapResult = {
        output: new ValueView(),
        unfilled: new ValueView(),
        priceImpact: undefined,
        metadataByAssetId: {},
      };
      return state;
    });
    expect(useStore.getState().swap.instantSwap.simulateSwapResult).toBeDefined();
    useStore.getState().swap.setAmount('123');
    expect(useStore.getState().swap.instantSwap.simulateSwapResult).toBeUndefined();
  });
});
