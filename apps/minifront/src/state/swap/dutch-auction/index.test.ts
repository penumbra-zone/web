import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '../..';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { OUTPUT_LIMIT } from '.';

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

          dutchAuction: {
            ...state.swap.dutchAuction,
            minOutput: '1.234',
            maxOutput: '5.678',
          },
        },
      }));
    });

    describe('when the estimation is a non-zero amount', () => {
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
      });

      it('sets `maxOutput` to twice the estimated market price', async () => {
        await useStore.getState().swap.dutchAuction.estimate();

        expect(useStore.getState().swap.dutchAuction.maxOutput).toBe('0.000444');
      });

      it('sets `minOutput` to half the estimated market price', async () => {
        await useStore.getState().swap.dutchAuction.estimate();

        expect(useStore.getState().swap.dutchAuction.minOutput).toBe('0.000111');
      });
    });

    describe('when the estimation is zero (because there is no liquidity)', () => {
      beforeEach(() => {
        mockSimulationClient.simulateTrade.mockResolvedValue({
          output: {
            output: {
              amount: {
                hi: 0n,
                lo: 0n,
              },
            },
          },
        });
      });

      it('leaves `maxOutput` at its previous value', async () => {
        await useStore.getState().swap.dutchAuction.estimate();

        expect(useStore.getState().swap.dutchAuction.maxOutput).toBe('5.678');
      });

      it('leaves `minOutput` at its previous value', async () => {
        await useStore.getState().swap.dutchAuction.estimate();

        expect(useStore.getState().swap.dutchAuction.minOutput).toBe('1.234');
      });
    });
  });

  describe('setMaxOutput()', () => {
    const DISPLAY_DENOM_EXPONENT = 6;

    beforeEach(() => {
      useStore.setState(state => {
        state.swap.assetOut = new Metadata({
          base: 'uasset',
          display: 'asset',
          denomUnits: [{ denom: 'uasset' }, { denom: 'asset', exponent: DISPLAY_DENOM_EXPONENT }],
        });
        state.swap.dutchAuction.maxOutput = '1.234';
        state.swap.dutchAuction.estimatedOutput = new Amount({ hi: 0n, lo: 123n });
        return state;
      });
    });

    it('updates the `maxOutput`', () => {
      useStore.getState().swap.dutchAuction.setMaxOutput('5.678');

      expect(useStore.getState().swap.dutchAuction.maxOutput).toBe('5.678');
    });

    it('clears the `estimatedOutput`', () => {
      useStore.getState().swap.dutchAuction.setMaxOutput('5.678');

      expect(useStore.getState().swap.dutchAuction.estimatedOutput).toBeUndefined();
    });

    it("does not allow a value greater than core's built-in limit", () => {
      const outputLimitDividedByExponent = OUTPUT_LIMIT / 10 ** DISPLAY_DENOM_EXPONENT;
      const outputLimitPlusOneDividedByExponent = (OUTPUT_LIMIT + 1) / 10 ** DISPLAY_DENOM_EXPONENT;

      useStore.getState().swap.dutchAuction.setMaxOutput(outputLimitDividedByExponent.toString());
      expect(useStore.getState().swap.dutchAuction.maxOutput).toBe(
        outputLimitDividedByExponent.toString(),
      );

      useStore
        .getState()
        .swap.dutchAuction.setMaxOutput(outputLimitPlusOneDividedByExponent.toString());
      expect(useStore.getState().swap.dutchAuction.maxOutput).toBe(
        outputLimitDividedByExponent.toString(),
      );
    });

    describe('when passed `0`', () => {
      it("updates `maxOutput` to the smallest possible value above 0 for the given asset's display denom exponent", () => {
        useStore.getState().swap.dutchAuction.setMaxOutput('0');

        expect(useStore.getState().swap.dutchAuction.maxOutput).toBe('0.000001');
      });
    });
  });

  describe('setMinOutput()', () => {
    const DISPLAY_DENOM_EXPONENT = 6;

    beforeEach(() => {
      useStore.setState(state => {
        state.swap.assetOut = new Metadata({
          base: 'uasset',
          display: 'asset',
          denomUnits: [{ denom: 'uasset' }, { denom: 'asset', exponent: DISPLAY_DENOM_EXPONENT }],
        });
        state.swap.dutchAuction.minOutput = '1.234';
        state.swap.dutchAuction.estimatedOutput = new Amount({ hi: 0n, lo: 123n });
        return state;
      });
    });

    it('updates the `minOutput`', () => {
      useStore.getState().swap.dutchAuction.setMinOutput('5.678');

      expect(useStore.getState().swap.dutchAuction.minOutput).toBe('5.678');
    });

    it('clears the `estimatedOutput`', () => {
      useStore.getState().swap.dutchAuction.setMinOutput('5.678');

      expect(useStore.getState().swap.dutchAuction.estimatedOutput).toBeUndefined();
    });

    it("does not allow a value greater than core's built-in limit", () => {
      const outputLimitDividedByExponent = OUTPUT_LIMIT / 10 ** DISPLAY_DENOM_EXPONENT;
      const outputLimitPlusOneDividedByExponent = (OUTPUT_LIMIT + 1) / 10 ** DISPLAY_DENOM_EXPONENT;

      useStore.getState().swap.dutchAuction.setMinOutput(outputLimitDividedByExponent.toString());
      expect(useStore.getState().swap.dutchAuction.minOutput).toBe(
        outputLimitDividedByExponent.toString(),
      );

      useStore
        .getState()
        .swap.dutchAuction.setMinOutput(outputLimitPlusOneDividedByExponent.toString());
      expect(useStore.getState().swap.dutchAuction.minOutput).toBe(
        outputLimitDividedByExponent.toString(),
      );
    });

    describe('when passed `0`', () => {
      it("updates `minOutput` to the smallest possible value above 0 for the given asset's display denom exponent", () => {
        useStore.getState().swap.dutchAuction.setMinOutput('0');

        expect(useStore.getState().swap.dutchAuction.minOutput).toBe('0.000001');
      });
    });
  });
});
