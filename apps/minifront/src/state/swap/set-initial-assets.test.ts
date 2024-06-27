import { create } from 'zustand';
import { AllSlices, initializeStore } from '..';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ZQueryState } from '@penumbra-zone/zquery';
import { emptyBalanceResponse } from '../../utils/empty-balance-response';
import { setInitialAssets } from './set-initial-assets';

describe('set-initial-assets', () => {
  const umToken = new Metadata({ symbol: 'UM', penumbraAssetId: { inner: new Uint8Array([1]) } });
  const usdcToken = new Metadata({
    symbol: 'USDC',
    penumbraAssetId: { inner: new Uint8Array([2]) },
  });
  const osmoToken = new Metadata({
    symbol: 'OSMO',
    penumbraAssetId: { inner: new Uint8Array([3]) },
  });

  const swappableAssets: ZQueryState<Metadata[]> = {
    data: [umToken, usdcToken, osmoToken],
    loading: false,
  } as ZQueryState<Metadata[]>;
  const emptySwappableAssets = {
    data: [] as Metadata[],
    loading: false,
  } as ZQueryState<Metadata[]>;

  const umBalance = new BalancesResponse({
    balanceView: new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: { hi: 0n, lo: 1n },
          metadata: umToken,
        },
      },
    }),
    accountAddress: new AddressView({
      addressView: {
        case: 'decoded',
        value: {
          index: { account: 0 },
        },
      },
    }),
  });
  const usdcBalance = emptyBalanceResponse(usdcToken, 1);

  const balancesResponses = {
    data: [umBalance, usdcBalance],
    loading: false,
  } as ZQueryState<BalancesResponse[]>;
  const emptyBalancesResponses: ZQueryState<BalancesResponse[]> = {
    data: [] as BalancesResponse[],
    loading: false,
  } as ZQueryState<BalancesResponse[]>;

  let useStore = create<AllSlices>()(initializeStore());
  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore());
    vi.restoreAllMocks();
    vi.stubGlobal('location', { hash: '#swap' });
  });

  it(`doesn't set data if balancesResponses or swappableAssets are empty`, () => {
    useStore.setState(state => {
      state.swap.balancesResponses = emptyBalancesResponses;
      state.swap.swappableAssets = emptySwappableAssets;
      return state;
    });

    setInitialAssets(useStore);

    expect(useStore.getState().swap.assetIn).toBeUndefined();
    expect(useStore.getState().swap.assetOut).toBeUndefined();
  });

  it('uses swappableAssets[0] to set assetIn and swappableAssets[1] to set assetOut when balancesResponses are empty', () => {
    useStore.setState(state => {
      state.swap.balancesResponses = emptyBalancesResponses;
      state.swap.swappableAssets = swappableAssets;
      return state;
    });

    setInitialAssets(useStore);

    expect(useStore.getState().swap.assetIn).toStrictEqual(emptyBalanceResponse(umToken, 0));
    expect(useStore.getState().swap.assetOut).toStrictEqual(swappableAssets.data![1]);
  });

  it('uses balancesResponses[0] to set assetIn and swappableAssets[0] to set assetOut', () => {
    useStore.setState(state => {
      state.swap.balancesResponses = balancesResponses;
      state.swap.swappableAssets = swappableAssets;
      return state;
    });

    setInitialAssets(useStore);

    expect(useStore.getState().swap.assetIn).toStrictEqual(balancesResponses.data![0]);
    expect(useStore.getState().swap.assetOut).toStrictEqual(swappableAssets.data![0]);
  });

  it('correctly sets assetIn and assetOut based on query params', () => {
    vi.stubGlobal('location', { hash: '#swap?from=USDC&to=OSMO&account=1' });

    useStore.setState(state => {
      state.swap.balancesResponses = balancesResponses;
      state.swap.swappableAssets = swappableAssets;
      return state;
    });

    setInitialAssets(useStore);

    expect(useStore.getState().swap.assetIn).toStrictEqual(usdcBalance);
    expect(useStore.getState().swap.assetOut).toStrictEqual(osmoToken);
  });
});
