import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZQueryState } from '@penumbra-zone/zquery';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { emptyBalanceResponse } from '../../utils/empty-balance-response';
import { create } from 'zustand';
import { AllSlices, initializeStore } from '..';

describe('swapBalancesMiddleware()', () => {
  const umToken = new Metadata({
    base: 'upenumbra',
    display: 'penumbra',
    denomUnits: [{ denom: 'upenumbra' }, { denom: 'penumbra', exponent: 6 }],
    symbol: 'UM',
    penumbraAssetId: { inner: new Uint8Array([1]) },
  });
  const usdcToken = new Metadata({
    base: 'uusdc',
    display: 'usdc',
    denomUnits: [{ denom: 'uusdc' }, { denom: 'usdc', exponent: 6 }],
    symbol: 'USDC',
    penumbraAssetId: { inner: new Uint8Array([2]) },
  });
  const osmoToken = new Metadata({
    base: 'uosmo',
    display: 'osmo',
    denomUnits: [{ denom: 'uosmo' }, { denom: 'osmo', exponent: 6 }],
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
    // `initializeStore()` initializes the store with all middlewares already
    // attached, so there's no need to set up a test rig for
    // `swapBalancesMiddleware` specifically
    useStore = create<AllSlices>()(initializeStore());
    vi.restoreAllMocks();
    vi.stubGlobal('location', { hash: '#swap' });
  });

  describe('when setting `shared.balancesResponses.data`', () => {
    describe('when the `from` query param is set', () => {
      beforeEach(() => {
        vi.stubGlobal('location', { hash: '#swap?from=USDC' });
      });

      it('sets `swap.assetIn` to the first balances response matching `from`', () => {
        useStore.setState(state => {
          state.shared.balancesResponses = balancesResponses;
          state.shared.assets = swappableAssets;
        });

        expect(useStore.getState().swap.assetIn).toStrictEqual(balancesResponses.data![1]);
      });

      describe('when `swap.assetIn` is already set', () => {
        it('sets `swap.assetIn` to the first balances response matching `from`', () => {
          useStore.setState(state => {
            state.swap.assetIn = umBalance;
          });
          expect(useStore.getState().swap.assetIn).toBe(umBalance);

          useStore.setState(state => {
            state.shared.balancesResponses = balancesResponses;
            state.shared.assets = swappableAssets;
          });

          expect(useStore.getState().swap.assetIn).toBe(usdcBalance);
        });
      });

      describe('when there is no matching balances response but there is a matching metadata', () => {
        it('sets `swap.assetIn` to a zero-value balances response with metadata matching `from`', () => {
          useStore.setState(state => {
            state.shared.balancesResponses = emptyBalancesResponses;
            state.shared.assets = swappableAssets;
          });

          expect(useStore.getState().swap.assetIn).toStrictEqual(
            emptyBalanceResponse(usdcToken, 0),
          );
        });
      });

      describe('when there is no matching balances response or metadata', () => {
        beforeEach(() => {
          vi.stubGlobal('location', { hash: '#swap?from=PIZZA' });
        });

        it('sets `swap.assetIn` to the first swappable asset', () => {
          useStore.setState(state => {
            state.shared.balancesResponses = emptyBalancesResponses;
            state.shared.assets = swappableAssets;
          });

          expect(useStore.getState().swap.assetIn).toStrictEqual(emptyBalanceResponse(umToken, 0));
        });
      });
    });

    describe('when the `from` query param is not set', () => {
      describe('when `shared.assets` is not empty', () => {
        it('sets `swap.assetIn` to the first swappable asset', () => {
          useStore.setState(state => {
            state.shared.balancesResponses = emptyBalancesResponses;
            state.shared.assets = swappableAssets;
          });

          expect(useStore.getState().swap.assetIn).toStrictEqual(emptyBalanceResponse(umToken, 0));
        });

        describe('when `swap.assetIn` is already set', () => {
          it("doesn't set `swap.assetIn`", () => {
            useStore.setState(state => {
              state.swap.assetIn = usdcBalance;
            });
            expect(useStore.getState().swap.assetIn).toBe(usdcBalance);

            useStore.setState(state => {
              state.shared.balancesResponses = balancesResponses;
              state.shared.assets = swappableAssets;
            });

            expect(useStore.getState().swap.assetIn).toBe(usdcBalance);
          });
        });
      });

      describe('when `shared.assets` is empty', () => {
        it("doesn't set `swap.assetIn`", () => {
          useStore.setState(state => {
            state.shared.balancesResponses = emptyBalancesResponses;
            state.shared.assets = emptySwappableAssets;
          });

          expect(useStore.getState().swap.assetIn).toBeUndefined();
        });
      });
    });
  });

  describe('when setting `shared.assets.data`', () => {
    describe('when the `to` query param is set', () => {
      beforeEach(() => {
        vi.stubGlobal('location', { hash: '#swap?to=USDC' });
      });

      it('sets `swap.assetOut` to the first asset matching `to`', () => {
        useStore.setState(state => {
          state.shared.assets = swappableAssets;
        });

        expect(useStore.getState().swap.assetOut).toStrictEqual(swappableAssets.data![1]);
      });

      describe('when `swap.assetOut` is already set', () => {
        it('sets `swap.assetOut` to the first asset matching `to`', () => {
          useStore.setState(state => {
            state.swap.assetOut = umToken;
          });
          expect(useStore.getState().swap.assetOut).toBe(umToken);

          useStore.setState(state => {
            state.shared.assets = swappableAssets;
          });

          expect(useStore.getState().swap.assetOut).toBe(usdcToken);
        });
      });

      describe('when there is no matching metadata', () => {
        beforeEach(() => {
          vi.stubGlobal('location', { hash: '#swap?to=PIZZA' });
        });

        it('sets `swap.assetOut` to the first swappable asset', () => {
          useStore.setState(state => {
            // Avoid triggering the mechanism that ensures that assetIn and
            // assetOut are different
            state.swap.assetIn = usdcBalance;
          });

          useStore.setState(state => {
            state.shared.assets = swappableAssets;
          });

          expect(useStore.getState().swap.assetOut).toStrictEqual(umToken);
        });
      });
    });

    describe('when the `to` query param is not set', () => {
      describe('when `shared.assets` is not empty', () => {
        it('sets `swap.assetOut` to the first swappable asset', () => {
          useStore.setState(state => {
            // Avoid triggering the mechanism that ensures that assetIn and
            // assetOut are different
            state.swap.assetIn = usdcBalance;
          });

          useStore.setState(state => {
            state.shared.assets = swappableAssets;
          });

          expect(useStore.getState().swap.assetOut).toStrictEqual(umToken);
        });
      });

      describe('when `shared.assets` is empty', () => {
        it("doesn't set `swap.assetOut`", () => {
          useStore.setState(state => {
            state.shared.assets = emptySwappableAssets;
          });

          expect(useStore.getState().swap.assetOut).toBeUndefined();
        });
      });

      describe('when `swap.assetOut` is already set', () => {
        it("doesn't set `swap.assetOut`", () => {
          useStore.setState(state => {
            state.swap.assetOut = usdcToken;
          });
          expect(useStore.getState().swap.assetOut).toBe(usdcToken);

          useStore.setState(state => {
            state.shared.assets = swappableAssets;
          });

          expect(useStore.getState().swap.assetOut).toBe(usdcToken);
        });
      });

      describe('when `swap.assetIn` is the same metadata as that the first swappable asset', () => {
        it('sets `swap.assetOut` to the second swappable asset', () => {
          useStore.setState(state => {
            state.swap.assetIn = umBalance;
          });

          useStore.setState(state => {
            state.shared.assets = swappableAssets;
          });

          expect(useStore.getState().swap.assetOut).toBe(usdcToken);
        });
      });
    });
  });
});
