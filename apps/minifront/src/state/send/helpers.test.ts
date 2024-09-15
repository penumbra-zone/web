import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AssetId,
  Metadata,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  BalancesResponse,
  TransactionPlannerRequest_Output,
  TransactionPlannerRequest_Spend,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { GasPrices } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { checkSendMaxInvariants } from './helpers.js';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

describe('sendMax', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the non-maximum amount of an alternative fee asset (GM), and pays fees with the native asset (UM).', async () => {
    const selectionExample = new BalancesResponse({
      balanceView: new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 0n,
              hi: 20000n,
            }),
            metadata: new Metadata({
              penumbraAssetId: { inner: assetId1.inner },
            }),
          },
        },
      }),
    });

    const request:
      | PartialMessage<TransactionPlannerRequest_Spend>
      | PartialMessage<TransactionPlannerRequest_Output> = {
      value: {
        amount: new Amount({
          lo: 0n,
          hi: 1n,
        }),
        assetId: getAssetIdFromValueView(selectionExample?.balanceView),
      },
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      stakingToken: true,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: false)
    // invariantTwo:  false
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the maximum amount of an alternative fee asset (GM), and pays fees with the native asset (UM).', async () => {
    const selectionExample = new BalancesResponse({
      balanceView: new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 0n,
              hi: 20000n,
            }),
            metadata: new Metadata({
              penumbraAssetId: { inner: assetId1.inner },
            }),
          },
        },
      }),
    });

    const request:
      | PartialMessage<TransactionPlannerRequest_Spend>
      | PartialMessage<TransactionPlannerRequest_Output> = {
      value: {
        amount: new Amount({
          lo: 0n,
          hi: 20000n,
        }),
        assetId: getAssetIdFromValueView(selectionExample?.balanceView),
      },
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      stakingToken: true,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: true)
    // invariantTwo:  false
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the non-maximum amount of an another asset (Pizza), and pays fees with an alternative fee asset (GN).', async () => {
    const selectionExample = new BalancesResponse({
      balanceView: new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 0n,
              hi: 20000n,
            }),
            metadata: new Metadata({
              penumbraAssetId: { inner: assetId3.inner },
            }),
          },
        },
      }),
    });

    const request:
      | PartialMessage<TransactionPlannerRequest_Spend>
      | PartialMessage<TransactionPlannerRequest_Output> = {
      value: {
        amount: new Amount({
          lo: 0n,
          hi: 1n,
        }),
        assetId: getAssetIdFromValueView(selectionExample?.balanceView),
      },
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      stakingToken: false,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: false)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: false)
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the maximum amount of an another asset (Pizza), and pays fees with an alternative fee asset (GN).', async () => {
    const selectionExample = new BalancesResponse({
      balanceView: new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 0n,
              hi: 20000n,
            }),
            metadata: new Metadata({
              penumbraAssetId: { inner: assetId3.inner },
            }),
          },
        },
      }),
    });

    const request:
      | PartialMessage<TransactionPlannerRequest_Spend>
      | PartialMessage<TransactionPlannerRequest_Output> = {
      value: {
        amount: new Amount({
          lo: 0n,
          hi: 20000n,
        }),
        assetId: getAssetIdFromValueView(selectionExample?.balanceView),
      },
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      stakingToken: false,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: true)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: false)
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the non-maximum amount of the native asset (UM).', async () => {
    const selectionExample = new BalancesResponse({
      balanceView: new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 0n,
              hi: 20000n,
            }),
            metadata: new Metadata({
              penumbraAssetId: { inner: stakingAssetId.inner },
            }),
          },
        },
      }),
    });

    const request:
      | PartialMessage<TransactionPlannerRequest_Spend>
      | PartialMessage<TransactionPlannerRequest_Output> = {
      value: {
        amount: new Amount({
          lo: 0n,
          hi: 1n,
        }),
        assetId: getAssetIdFromValueView(selectionExample?.balanceView),
      },
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      stakingToken: true,
    });

    // invariantOne:  false (isUmAsset: true, isMaxAmount: false)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: false)
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the maximum amount of the native asset (UM).', async () => {
    const selectionExample = new BalancesResponse({
      balanceView: new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 0n,
              hi: 20000n,
            }),
            metadata: new Metadata({
              penumbraAssetId: { inner: stakingAssetId.inner },
            }),
          },
        },
      }),
    });

    const request:
      | PartialMessage<TransactionPlannerRequest_Spend>
      | PartialMessage<TransactionPlannerRequest_Output> = {
      value: {
        amount: new Amount({
          lo: 0n,
          hi: 20000n,
        }),
        assetId: getAssetIdFromValueView(selectionExample?.balanceView),
      },
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      stakingToken: true,
    });

    // invariantOne:  false (isUmAsset: true, isMaxAmount: true)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: false)
    // isSendingMax:  true

    expect(result).toBe(true);
  });

  it('sends the non-maximum amount of alternative asset (GM), and pays fees with the same alternative asset (GM) since the native token (UM) is absent.', async () => {
    const selectionExample = new BalancesResponse({
      balanceView: new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 0n,
              hi: 20000n,
            }),
            metadata: new Metadata({
              penumbraAssetId: { inner: assetId1.inner },
            }),
          },
        },
      }),
    });

    const request:
      | PartialMessage<TransactionPlannerRequest_Spend>
      | PartialMessage<TransactionPlannerRequest_Output> = {
      value: {
        amount: new Amount({
          lo: 0n,
          hi: 1n,
        }),
        assetId: getAssetIdFromValueView(selectionExample?.balanceView),
      },
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      stakingToken: false,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: false)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: true, isMaxAmount: false)
    // isSendingMax:  false

    expect(result).toBe(false);
  });

  it('sends the maximum amount of alternative asset (GM), and pays fees with the same alternative asset (GM) since the native token (UM) is absent.', async () => {
    const selectionExample = new BalancesResponse({
      balanceView: new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: new Amount({
              lo: 0n,
              hi: 20000n,
            }),
            metadata: new Metadata({
              penumbraAssetId: { inner: assetId1.inner },
            }),
          },
        },
      }),
    });

    const request:
      | PartialMessage<TransactionPlannerRequest_Spend>
      | PartialMessage<TransactionPlannerRequest_Output> = {
      value: {
        amount: new Amount({
          lo: 0n,
          hi: 20000n,
        }),
        assetId: getAssetIdFromValueView(selectionExample?.balanceView),
      },
    };

    const result = checkSendMaxInvariants({
      selection: selectionExample,
      spendOrOutput: request,
      gasPrices: [stakingTokenPrice, AltTokenPrice1, AltTokenPrice2],
      stakingToken: false,
    });

    // invariantOne:  false (isUmAsset: false, isMaxAmount: false)
    // invariantTwo:  false (isAlternativeAssetUsedForFees: true, isMaxAmount: true)
    // isSendingMax:  true

    expect(result).toBe(true);
  });
});

// UM
const stakingAssetId = new AssetId({
  inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
});

let stakingTokenPrice = new GasPrices({
  assetId: stakingAssetId,
  blockSpacePrice: 60n,
  compactBlockSpacePrice: 1556n,
  verificationPrice: 1n,
  executionPrice: 1n,
});

// GM
const assetId1 = new AssetId({
  inner: base64ToUint8Array('HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc='),
});

let AltTokenPrice1 = new GasPrices({
  assetId: assetId1,
  blockSpacePrice: 120n,
  compactBlockSpacePrice: 3112n,
  verificationPrice: 2n,
  executionPrice: 2n,
});

// GN
const assetId2 = new AssetId({
  inner: base64ToUint8Array('nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE='),
});

let AltTokenPrice2 = new GasPrices({
  assetId: assetId2,
  blockSpacePrice: 120n,
  compactBlockSpacePrice: 3112n,
  verificationPrice: 2n,
  executionPrice: 2n,
});

// PIZZA
const assetId3 = new AssetId({
  inner: base64ToUint8Array('nDjzm+ldIrNMJha1anGMDVxpA5cLCPnUYQ1clmHF1gw='),
});
