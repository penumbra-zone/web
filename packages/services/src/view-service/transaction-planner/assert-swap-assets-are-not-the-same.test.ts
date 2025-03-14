import { describe, expect, it } from 'vitest';
import { create } from '@bufbuild/protobuf';
import { assertSwapAssetsAreNotTheSame } from './assert-swap-assets-are-not-the-same.js';
import {
  TransactionPlannerRequestSchema,
  TransactionPlannerRequest_SwapSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

const swapWithSameAssets = create(TransactionPlannerRequest_SwapSchema, {
  value: {
    assetId: {
      inner: new Uint8Array([0, 1, 2, 3]),
    },
  },
  targetAsset: {
    inner: new Uint8Array([0, 1, 2, 3]),
  },
});

const swapWithDifferentAssets = create(TransactionPlannerRequest_SwapSchema, {
  value: {
    assetId: {
      inner: new Uint8Array([0, 1, 2, 3]),
    },
  },
  targetAsset: {
    inner: new Uint8Array([4, 5, 6, 7]),
  },
});

const transactionPlanContainingSwapWithSameAssets = create(TransactionPlannerRequestSchema, {
  swaps: [swapWithSameAssets],
});

const transactionPlanContainingSwapWithDifferentAssets = create(TransactionPlannerRequestSchema, {
  swaps: [swapWithDifferentAssets],
});

const transactionPlanContainingBothSwapTypes = create(TransactionPlannerRequestSchema, {
  swaps: [swapWithDifferentAssets, swapWithSameAssets],
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
