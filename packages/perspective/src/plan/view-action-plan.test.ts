import { describe, expect, test, vi } from 'vitest';
import { create, toJson } from '@bufbuild/protobuf';
import { viewActionPlan } from './view-action-plan.js';
import {
  ActionPlanSchema,
  ActionViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import {
  OutputView,
  OutputView_Visible,
  SpendView,
  SpendView_Visible,
} from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  AssetIdSchema,
  MetadataSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import type { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  AddressSchema,
  FullViewingKeySchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import {
  SwapPlaintextSchema,
  BatchSwapOutputDataSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import {
  DelegateSchema,
  UndelegateSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';

import {
  ActionDutchAuctionScheduleSchema,
  ActionDutchAuctionWithdrawPlanSchema,
  ActionDutchAuctionWithdrawSchema,
  AuctionIdSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

vi.mock('@penumbra-zone/wasm/auction', () => ({
  getAuctionId: () => create(AuctionIdSchema, { inner: new Uint8Array([0, 1, 2, 3]) }),
}));

describe('viewActionPlan()', () => {
  const addressAsBech32 =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const address = create(AddressSchema, addressFromBech32m(addressAsBech32));
  const assetId = create(AssetIdSchema, { inner: new Uint8Array() });
  const metadata = create(MetadataSchema, { penumbraAssetId: assetId });
  const metadataByAssetId = vi.fn(() => Promise.resolve(metadata));
  const mockFvk = create(
    FullViewingKeySchema,
    fullViewingKeyFromBech32m(
      'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
    ),
  );

  describe('`spend` action', () => {
    const validSpendActionPlan = create(ActionPlanSchema, {
      action: {
        case: 'spend',
        value: {
          note: {
            address,
            value: {
              amount: { hi: 1n, lo: 0n },
              assetId,
            },
          },
        },
      },
    });

    test('throws if the address is missing', async () => {
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'spend',
          value: {
            note: {},
          },
        },
      });

      await expect(viewActionPlan(metadataByAssetId, mockFvk)(actionPlan)).rejects.toThrow(
        'No address in spend plan',
      );
    });

    test('includes the amount', async () => {
      const actionView = await viewActionPlan(metadataByAssetId, mockFvk)(validSpendActionPlan);
      const spendView = actionView.actionView.value as SpendView;
      const spendViewVisible = spendView.spendView.value as SpendView_Visible;

      expect(spendViewVisible.note!.value?.valueView.value?.amount).toEqual(
        create(AmountSchema, {
          hi: 1n,
          lo: 0n,
        }),
      );
    });

    test('throws if the amount is missing', async () => {
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'spend',
          value: {
            note: {
              address,
            },
          },
        },
      });

      await expect(viewActionPlan(metadataByAssetId, mockFvk)(actionPlan)).rejects.toThrow(
        'No value in note',
      );
    });

    test('includes the denom metadata', () =>
      expect(
        viewActionPlan(metadataByAssetId, mockFvk)(validSpendActionPlan),
      ).resolves.toHaveProperty(
        'actionView.value.spendView.value.note.value.valueView.value.metadata',
        metadata,
      ));

    test('throws if the asset ID is missing', async () => {
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'spend',
          value: {
            note: {
              address,
              value: { amount: { hi: 1n, lo: 0n } },
            },
          },
        },
      });

      await expect(viewActionPlan(metadataByAssetId, mockFvk)(actionPlan)).rejects.toThrow(
        'No asset ID in value',
      );
    });
  });

  describe('`output` action', () => {
    const addressAsBech32 =
      'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
    const destAddress = create(AddressSchema, addressFromBech32m(addressAsBech32));
    const validOutputActionPlan = create(ActionPlanSchema, {
      action: {
        case: 'output',
        value: {
          value: {
            amount: { hi: 1n, lo: 0n },
            assetId,
          },
          destAddress,
        },
      },
    });

    test('includes the destAddress', async () => {
      const actionView = await viewActionPlan(metadataByAssetId, mockFvk)(validOutputActionPlan);
      const outputView = actionView.actionView.value as OutputView;
      const outputViewVisible = outputView.outputView.value as OutputView_Visible;

      expect(outputViewVisible.note?.address?.addressView.value?.address).toEqual(destAddress);
    });

    test('throws if the destAddress is missing', async () => {
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'output',
          value: {
            value: {
              amount: { hi: 1n, lo: 0n },
              assetId,
            },
          },
        },
      });

      await expect(viewActionPlan(metadataByAssetId, mockFvk)(actionPlan)).rejects.toThrow(
        'No destAddress in output plan',
      );
    });

    test('includes the amount', async () => {
      const actionView = await viewActionPlan(metadataByAssetId, mockFvk)(validOutputActionPlan);
      const outputView = actionView.actionView.value as OutputView;
      const outputViewVisible = outputView.outputView.value as OutputView_Visible;

      expect(outputViewVisible.note?.value?.valueView.value?.amount).toEqual(
        create(AmountSchema, {
          hi: 1n,
          lo: 0n,
        }),
      );
    });

    test('throws if the amount is missing', async () => {
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'output',
          value: {
            destAddress,
          },
        },
      });

      await expect(viewActionPlan(metadataByAssetId, mockFvk)(actionPlan)).rejects.toThrow(
        'No value to view',
      );
    });

    test('includes the denom metadata', () =>
      expect(
        viewActionPlan(metadataByAssetId, mockFvk)(validOutputActionPlan),
      ).resolves.toHaveProperty(
        'actionView.value.outputView.value.note.value.valueView.value.metadata',
        metadata,
      ));

    test('throws if the asset ID is missing', async () => {
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'output',
          value: {
            value: {
              amount: { hi: 1n, lo: 0n },
            },
            destAddress,
          },
        },
      });

      await expect(viewActionPlan(metadataByAssetId, mockFvk)(actionPlan)).rejects.toThrow(
        'No asset ID in value',
      );
    });
  });

  describe('`swap` action', () => {
    test('returns an action view with the `swap` case', async () => {
      const swapPlaintext = create(SwapPlaintextSchema, {
        claimAddress: {
          inner: new Uint8Array([0, 1, 2, 3]),
        },
        claimFee: {
          amount: {
            hi: 123n,
            lo: 456n,
          },
          assetId: {
            inner: new Uint8Array([0, 1, 2, 3]),
          },
        },
        delta1I: {
          hi: 123n,
          lo: 456n,
        },
        delta2I: {
          hi: 123n,
          lo: 456n,
        },
        rseed: new Uint8Array([0, 1, 2, 3]),
        tradingPair: {
          asset1: {
            inner: new Uint8Array([0, 1, 2, 3]),
          },
          asset2: {
            inner: new Uint8Array([4, 5, 6, 7]),
          },
        },
      });

      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'swap',
          value: {
            feeBlinding: new Uint8Array([0, 1, 2, 3]),
            proofBlindingR: new Uint8Array([0, 1, 2, 3]),
            proofBlindingS: new Uint8Array([0, 1, 2, 3]),
            swapPlaintext,
          },
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      const expected = create(ActionViewSchema, {
        actionView: {
          case: 'swap',
          value: {
            swapView: {
              case: 'visible',
              value: {
                swap: {
                  body: {
                    delta1I: swapPlaintext.delta1I,
                    delta2I: swapPlaintext.delta2I,
                    tradingPair: swapPlaintext.tradingPair,
                  },
                },
                swapPlaintext,
                asset1Metadata: metadata,
                asset2Metadata: metadata,
              },
            },
          },
        },
      });

      await expect(actionView).resolves.toEqual(expected);
    });
  });

  describe('`swapClaim` action', () => {
    test('returns an action view with the `swapClaim` case', async () => {
      const asset1Id = create(AssetIdSchema, { inner: new Uint8Array([0, 1, 2, 3]) });
      const asset2Id = create(AssetIdSchema, { inner: new Uint8Array([4, 5, 6, 7]) });
      const metadataByAssetId = vi.fn((id: AssetId) =>
        Promise.resolve(create(MetadataSchema, { penumbraAssetId: id })),
      );

      const swapPlaintext = create(SwapPlaintextSchema, {
        claimAddress: address,
        claimFee: {
          amount: {
            hi: 123n,
            lo: 456n,
          },
          assetId: {
            inner: new Uint8Array([0, 1, 2, 3]),
          },
        },
        delta1I: {
          hi: 123n,
          lo: 456n,
        },
        delta2I: {
          hi: 123n,
          lo: 456n,
        },
        rseed: new Uint8Array([0, 1, 2, 3]),
        tradingPair: {
          asset1: asset1Id,
          asset2: asset2Id,
        },
      });

      const outputData = create(BatchSwapOutputDataSchema, {
        delta1: swapPlaintext.delta1I,
        delta2: swapPlaintext.delta2I,
        epochStartingHeight: 1n,
        unfilled1: { hi: 123n, lo: 456n },
        unfilled2: { hi: 456n, lo: 789n },
        height: 2n,
        lambda1: {
          hi: 1n,
          lo: 2n,
        },
        lambda2: {
          hi: 3n,
          lo: 4n,
        },
        tradingPair: swapPlaintext.tradingPair,
      });

      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'swapClaim',
          value: {
            epochDuration: 1n,
            position: 1n,
            proofBlindingR: new Uint8Array([0, 1, 2, 3]),
            proofBlindingS: new Uint8Array([4, 5, 6, 7]),
            swapPlaintext,
            outputData,
          },
        },
      });

      const actionView = await viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      const expected = create(ActionViewSchema, {
        actionView: {
          case: 'swapClaim',
          value: {
            swapClaimView: {
              case: 'visible',
              value: {
                output1: {
                  address: {
                    addressView: {
                      case: 'decoded',
                      value: {
                        address: swapPlaintext.claimAddress,
                        index: {},
                      },
                    },
                  },
                  value: {
                    valueView: {
                      case: 'knownAssetId',
                      value: {
                        amount: outputData.lambda1,
                        metadata: await metadataByAssetId(asset1Id),
                      },
                    },
                  },
                },
                output2: {
                  address: {
                    addressView: {
                      case: 'decoded',
                      value: {
                        address: swapPlaintext.claimAddress,
                        index: {},
                      },
                    },
                  },
                  value: {
                    valueView: {
                      case: 'knownAssetId',
                      value: {
                        amount: outputData.lambda2,
                        metadata: await metadataByAssetId(asset2Id),
                      },
                    },
                  },
                },
                swapClaim: {
                  body: {
                    fee: swapPlaintext.claimFee,
                    outputData,
                  },
                  epochDuration: 1n,
                },
              },
            },
          },
        },
      });

      // Since these are such big objects, we'll compare their JSON outputs
      // rather than using `expect(actionView.equals(expected)).toBe(true)`,
      // since the former gives us much more useful output when the test fails.
      expect(toJson(ActionViewSchema, actionView)).toEqual(toJson(ActionViewSchema, expected));
    });
  });

  describe('`withdrawal` action', () => {
    test('returns an action view with the `ics20Withdrawal` case as-is', async () => {
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'ics20Withdrawal',
          value: { amount: { hi: 1n, lo: 0n } },
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        create(ActionViewSchema, {
          actionView: {
            case: 'ics20Withdrawal',
            value: { amount: { hi: 1n, lo: 0n } },
          },
        }),
      );
    });
  });

  describe('`delegate` action', () => {
    test('returns an action view with the action as-is', async () => {
      const delegate = create(DelegateSchema, {
        epochIndex: 0n,
        delegationAmount: { hi: 123n, lo: 456n },
      });
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'delegate',
          value: delegate,
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        create(ActionViewSchema, {
          actionView: {
            case: 'delegate',
            value: delegate,
          },
        }),
      );
    });
  });

  describe('`undelegate` action', () => {
    test('returns an action view with the action as-is', async () => {
      const undelegate = create(UndelegateSchema, {
        startEpochIndex: 0n,
        delegationAmount: { hi: 123n, lo: 456n },
      });
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'undelegate',
          value: undelegate,
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        create(ActionViewSchema, {
          actionView: {
            case: 'undelegate',
            value: undelegate,
          },
        }),
      );
    });
  });

  describe('`actionDutchAuctionSchedule` action', () => {
    test('returns an action view with the appropriate view', async () => {
      const schedule = create(ActionDutchAuctionScheduleSchema, {
        description: {
          input: {
            amount: { hi: 0n, lo: 1n },
            assetId: {},
          },
          outputId: {},
        },
      });
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'actionDutchAuctionSchedule',
          value: schedule,
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        create(ActionViewSchema, {
          actionView: {
            case: 'actionDutchAuctionSchedule',
            value: {
              action: schedule,
              auctionId: { inner: new Uint8Array([0, 1, 2, 3]) },
              inputMetadata: metadata,
              outputMetadata: metadata,
            },
          },
        }),
      );
    });
  });

  describe('`actionDutchAuctionWithdraw` action', () => {
    test('returns an action view with the action and reserves', async () => {
      const withdraw = create(ActionDutchAuctionWithdrawPlanSchema, {
        auctionId: {},
        seq: 0n,
        reservesInput: {
          amount: { hi: 0n, lo: 1234n },
          assetId: {},
        },
        reservesOutput: {
          amount: { hi: 0n, lo: 5678n },
          assetId: {},
        },
      });
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'actionDutchAuctionWithdraw',
          value: withdraw,
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        create(ActionViewSchema, {
          actionView: {
            case: 'actionDutchAuctionWithdraw',
            value: {
              action: create(ActionDutchAuctionWithdrawSchema, {
                auctionId: {},
                seq: 0n,
              }),
              reserves: [
                {
                  valueView: {
                    case: 'knownAssetId',
                    value: {
                      amount: { hi: 0n, lo: 1234n },
                      metadata,
                    },
                  },
                },
                {
                  valueView: {
                    case: 'knownAssetId',
                    value: {
                      amount: { hi: 0n, lo: 5678n },
                      metadata,
                    },
                  },
                },
              ],
            },
          },
        }),
      );
    });
  });

  describe('all other action cases', () => {
    test('returns an action view with the case but no value', async () => {
      const actionPlan = create(ActionPlanSchema, {
        action: {
          case: 'proposalSubmit',
          value: {},
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        create(ActionViewSchema, {
          actionView: {
            case: 'proposalSubmit',
            value: {},
          },
        }),
      );
    });
  });
});
