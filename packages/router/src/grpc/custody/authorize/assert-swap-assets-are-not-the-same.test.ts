import { describe, expect, it } from 'vitest';
import { assertSwapAssetsAreNotTheSame } from './assert-swap-assets-are-not-the-same';
import {
  ActionPlan,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

const swapWithSameAssets = new ActionPlan({
  action: {
    case: 'swap',
    value: {
      swapPlaintext: {
        tradingPair: {
          asset1: {
            inner: new Uint8Array([0, 1, 2, 3]),
          },
          asset2: {
            inner: new Uint8Array([0, 1, 2, 3]),
          },
        },
      },
    },
  },
});

const swapWithDifferentAssets = new ActionPlan({
  action: {
    case: 'swap',
    value: {
      swapPlaintext: {
        tradingPair: {
          asset1: {
            inner: new Uint8Array([0, 1, 2, 3]),
          },
          asset2: {
            inner: new Uint8Array([4, 5, 6, 7]),
          },
        },
      },
    },
  },
});

const transactionPlanContainingSwapWithSameAssets = new TransactionPlan({
  actions: [swapWithSameAssets],
});

const transactionPlanContainingSwapWithDifferentAssets = new TransactionPlan({
  actions: [swapWithDifferentAssets],
});

const transactionPlanContainingBothSwapTypes = new TransactionPlan({
  actions: [swapWithDifferentAssets, swapWithSameAssets],
});

describe('assertSwapAssetsAreNotTheSame()', () => {
  it("does not throw if the swap's trading pair are different assets", () => {
    expect(() =>
      assertSwapAssetsAreNotTheSame(transactionPlanContainingSwapWithDifferentAssets),
    ).not.toThrow();
  });

  it("throws if the swap's trading pair are the same assets", () => {
    expect(() =>
      assertSwapAssetsAreNotTheSame(transactionPlanContainingSwapWithSameAssets),
    ).toThrow(
      'Attempted to make a swap in which both assets were of the same type. A swap must be between two different asset types.',
    );
  });

  it("throws if there are multiple swaps, and only one swap's trading pair are the same assets", () => {
    expect(() => assertSwapAssetsAreNotTheSame(transactionPlanContainingBothSwapTypes)).toThrow(
      'Attempted to make a swap in which both assets were of the same type. A swap must be between two different asset types.',
    );
  });
});
