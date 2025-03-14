import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@bufbuild/protobuf';
import {
  AssetIdSchema,
  MetadataSchema,
  ValueSchema,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponseSchema } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { GasPricesSchema } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { checkSendMaxInvariants, SpendOrOutput } from './helpers.js';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { AddressSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

describe('sendMax', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the non-maximum amount of an alternative fee asset (GM), and pays fees with the native asset (UM).', () => {
    const selectionExample = create(BalancesResponseSchema, {
      balanceView: create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: create(AmountSchema, {
              lo: 0n,
              hi: 20000n,
            }),
            metadata: create(MetadataSchema, {
              penumbraAssetId: { inner: assetId1.inner },
            }),
          },
        },
      }),
    });

    const request: SpendOrOutput = {
      value: create(ValueSchema, {
        amount: create(AmountSchema, {
          lo: 0n,
          hi: 1n,
        }),
        assetId: getAssetIdFromValueView(selectionExample.balanceView),
      }),
      address: create(AddressSchema, { altBech32m: 'xyz_recipient' }),
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      hasStakingToken: true,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: false)
    // invariantTwo:  false
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the maximum amount of an alternative fee asset (GM), and pays fees with the native asset (UM).', () => {
    const selectionExample = create(BalancesResponseSchema, {
      balanceView: create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: create(AmountSchema, {
              lo: 0n,
              hi: 20000n,
            }),
            metadata: create(MetadataSchema, {
              penumbraAssetId: { inner: assetId1.inner },
            }),
          },
        },
      }),
    });

    const request: SpendOrOutput = {
      value: create(ValueSchema, {
        amount: {
          lo: 0n,
          hi: 20000n,
        },
        assetId: getAssetIdFromValueView(selectionExample.balanceView),
      }),
      address: create(AddressSchema, { altBech32m: 'xyz_recipient' }),
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      hasStakingToken: true,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: true)
    // invariantTwo:  false
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the non-maximum amount of an another asset (Pizza), and pays fees with an alternative fee asset (GN).', () => {
    const selectionExample = create(BalancesResponseSchema, {
      balanceView: create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: create(AmountSchema, {
              lo: 0n,
              hi: 20000n,
            }),
            metadata: create(MetadataSchema, {
              penumbraAssetId: { inner: assetId3.inner },
            }),
          },
        },
      }),
    });

    const request: SpendOrOutput = {
      value: create(ValueSchema, {
        amount: {
          lo: 0n,
          hi: 1n,
        },
        assetId: getAssetIdFromValueView(selectionExample.balanceView),
      }),
      address: create(AddressSchema, { altBech32m: 'xyz_recipient' }),
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      hasStakingToken: false,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: false)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: false)
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the maximum amount of an another asset (Pizza), and pays fees with an alternative fee asset (GN).', () => {
    const selectionExample = create(BalancesResponseSchema, {
      balanceView: create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: create(AmountSchema, {
              lo: 0n,
              hi: 20000n,
            }),
            metadata: create(MetadataSchema, {
              penumbraAssetId: { inner: assetId3.inner },
            }),
          },
        },
      }),
    });

    const request: SpendOrOutput = {
      value: create(ValueSchema, {
        amount: {
          lo: 0n,
          hi: 20000n,
        },
        assetId: getAssetIdFromValueView(selectionExample.balanceView),
      }),
      address: create(AddressSchema, { altBech32m: 'xyz_recipient' }),
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      hasStakingToken: false,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: true)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: false)
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the non-maximum amount of the native asset (UM).', () => {
    const selectionExample = create(BalancesResponseSchema, {
      balanceView: create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: create(AmountSchema, {
              lo: 0n,
              hi: 20000n,
            }),
            metadata: create(MetadataSchema, {
              penumbraAssetId: { inner: stakingAssetId.inner },
            }),
          },
        },
      }),
    });

    const request: SpendOrOutput = {
      value: create(ValueSchema, {
        amount: {
          lo: 0n,
          hi: 1n,
        },
        assetId: getAssetIdFromValueView(selectionExample.balanceView),
      }),
      address: create(AddressSchema, { altBech32m: 'xyz_recipient' }),
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      hasStakingToken: true,
    });

    // invariantOne:  false (isUmAsset: true, isMaxAmount: false)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: false)
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the maximum amount of the native asset (UM).', () => {
    const selectionExample = create(BalancesResponseSchema, {
      balanceView: create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: create(AmountSchema, {
              lo: 0n,
              hi: 20000n,
            }),
            metadata: create(MetadataSchema, {
              penumbraAssetId: { inner: stakingAssetId.inner },
            }),
          },
        },
      }),
    });

    const request: SpendOrOutput = {
      value: create(ValueSchema, {
        amount: {
          lo: 0n,
          hi: 20000n,
        },
        assetId: getAssetIdFromValueView(selectionExample.balanceView),
      }),
      address: create(AddressSchema, { altBech32m: 'xyz_recipient' }),
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      hasStakingToken: true,
    });

    // invariantOne:  false (isUmAsset: true, isMaxAmount: true)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: false)
    // isSendingMax:  true

    expect(result).toBe(true);
  });

  it('sends the non-maximum amount of alternative asset (GM), and pays fees with the same alternative asset (GM) since the native token (UM) is absent.', () => {
    const selectionExample = create(BalancesResponseSchema, {
      balanceView: create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: create(AmountSchema, {
              lo: 0n,
              hi: 20000n,
            }),
            metadata: create(MetadataSchema, {
              penumbraAssetId: { inner: assetId1.inner },
            }),
          },
        },
      }),
    });

    const request: SpendOrOutput = {
      value: create(ValueSchema, {
        amount: {
          lo: 0n,
          hi: 1n,
        },
        assetId: getAssetIdFromValueView(selectionExample.balanceView),
      }),
      address: create(AddressSchema, { altBech32m: 'xyz_recipient' }),
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      hasStakingToken: false,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: false)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: true, isMaxAmount: false)
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the maximum amount of alternative asset (GM), and pays fees with the same alternative asset (GM) since the native token (UM) is absent.', () => {
    const selectionExample = create(BalancesResponseSchema, {
      balanceView: create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: create(AmountSchema, {
              lo: 0n,
              hi: 20000n,
            }),
            metadata: create(MetadataSchema, {
              penumbraAssetId: { inner: assetId1.inner },
            }),
          },
        },
      }),
    });

    const request: SpendOrOutput = {
      value: create(ValueSchema, {
        amount: {
          lo: 0n,
          hi: 20000n,
        },
        assetId: getAssetIdFromValueView(selectionExample.balanceView),
      }),
      address: create(AddressSchema, { altBech32m: 'xyz_recipient' }),
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      hasStakingToken: false,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: false)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: true, isMaxAmount: true)
    // isSendingMax:  true

    expect(result).toBe(true);
  });
});

// UM
const stakingAssetId = create(AssetIdSchema, {
  inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
});

const stakingTokenPrice = create(GasPricesSchema, {
  assetId: stakingAssetId,
  blockSpacePrice: 60n,
  compactBlockSpacePrice: 1556n,
  verificationPrice: 1n,
  executionPrice: 1n,
});

// GM
const assetId1 = create(AssetIdSchema, {
  inner: base64ToUint8Array('HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc='),
});

const AltTokenPrice1 = create(GasPricesSchema, {
  assetId: assetId1,
  blockSpacePrice: 120n,
  compactBlockSpacePrice: 3112n,
  verificationPrice: 2n,
  executionPrice: 2n,
});

// GN
const assetId2 = create(AssetIdSchema, {
  inner: base64ToUint8Array('nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE='),
});

const AltTokenPrice2 = create(GasPricesSchema, {
  assetId: assetId2,
  blockSpacePrice: 120n,
  compactBlockSpacePrice: 3112n,
  verificationPrice: 2n,
  executionPrice: 2n,
});

// PIZZA
const assetId3 = create(AssetIdSchema, {
  inner: base64ToUint8Array('nDjzm+ldIrNMJha1anGMDVxpA5cLCPnUYQ1clmHF1gw='),
});
