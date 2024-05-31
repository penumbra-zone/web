import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '../..';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

const mockSimulationClient = vi.hoisted(() => ({
  simulateTrade: vi.fn(),
}));

vi.mock('../../../clients', () => ({
  simulationClient: mockSimulationClient,
}));

describe('Dutch auction slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  describe('estimate()', () => {
    beforeEach(() => {
      mockSimulationClient.simulateTrade.mockResolvedValue({
        output: {
          output: {
            amount: {
              hi: 0n,
              lo: 222n,
            },
          },
        },
      });

      useStore.setState(state => ({
        ...state,
        swap: {
          ...state.swap,
          assetIn: new BalancesResponse({
            balanceView: {
              valueView: {
                case: 'knownAssetId',
                value: {
                  amount: {
                    hi: 0n,
                    lo: 123n,
                  },
                  metadata: {
                    base: 'upenumbra',
                    display: 'penumbra',
                    denomUnits: [{ denom: 'upenumbra' }, { denom: 'penumbra', exponent: 6 }],
                    penumbraAssetId: { inner: new Uint8Array([1]) },
                  },
                },
              },
            },
          }),
          assetOut: new Metadata({
            base: 'ugm',
            display: 'gm',
            denomUnits: [{ denom: 'ugm' }, { denom: 'gm', exponent: 6 }],
            penumbraAssetId: { inner: new Uint8Array([2]) },
          }),
        },
      }));
    });

    it('sets `maxOutput` to twice the estimated market price', async () => {
      await useStore.getState().swap.dutchAuction.estimate();

      expect(useStore.getState().swap.dutchAuction.maxOutput).toEqual('0.000444');
    });

    it('sets `minOutput` to half the estimated market price', async () => {
      await useStore.getState().swap.dutchAuction.estimate();

      expect(useStore.getState().swap.dutchAuction.minOutput).toEqual('0.000111');
    });
  });
});
