import { describe, expect, test, vi } from 'vitest';
import { viewActionPlan } from './view-action-plan';
import {
  ActionPlan,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import {
  OutputView,
  OutputView_Visible,
  SpendView,
  SpendView_Visible,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  Address,
  FullViewingKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  SwapPlaintext,
  BatchSwapOutputData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import {
  Delegate,
  Undelegate,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import {
  ActionDutchAuctionSchedule,
  ActionDutchAuctionWithdrawPlan,
  AuctionId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';

vi.mock('@penumbra-zone/wasm/auction', () => ({
  getAuctionId: () => new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) }),
}));

describe('viewActionPlan()', () => {
  const addressAsBech32 =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const address = new Address(addressFromBech32m(addressAsBech32));
  const assetId = new AssetId({ inner: new Uint8Array() });
  const metadata = new Metadata({ penumbraAssetId: assetId });
  const metadataByAssetId = vi.fn(() => Promise.resolve(metadata));
  const mockFvk = new FullViewingKey(
    fullViewingKeyFromBech32m(
      'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
    ),
  );

  describe('`spend` action', () => {
    const validSpendActionPlan = new ActionPlan({
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
      const actionPlan = new ActionPlan({
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

      expect(spendViewVisible.note!.value?.valueView.value?.amount).toEqual({
        hi: 1n,
        lo: 0n,
      });
    });

    test('throws if the amount is missing', async () => {
      const actionPlan = new ActionPlan({
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
      const actionPlan = new ActionPlan({
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
    const destAddress = new Address(addressFromBech32m(addressAsBech32));
    const validOutputActionPlan = new ActionPlan({
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
      const actionPlan = new ActionPlan({
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

      expect(outputViewVisible.note?.value?.valueView.value?.amount).toEqual({
        hi: 1n,
        lo: 0n,
      });
    });

    test('throws if the amount is missing', async () => {
      const actionPlan = new ActionPlan({
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
      const actionPlan = new ActionPlan({
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
      const swapPlaintext = new SwapPlaintext({
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

      const actionPlan = new ActionPlan({
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

      const expected = new ActionView({
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
      const asset1Id = new AssetId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const asset2Id = new AssetId({ inner: new Uint8Array([4, 5, 6, 7]) });
      const metadataByAssetId = vi.fn((id: AssetId) =>
        Promise.resolve(new Metadata({ penumbraAssetId: id })),
      );

      const swapPlaintext = new SwapPlaintext({
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

      const outputData = new BatchSwapOutputData({
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

      const actionPlan = new ActionPlan({
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

      const expected = new ActionView({
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
      expect(actionView.toJson()).toEqual(expected.toJson());
    });
  });

  describe('`withdrawal` action', () => {
    test('returns an action view with the `ics20Withdrawal` case as-is', async () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'ics20Withdrawal',
          value: { amount: { hi: 1n, lo: 0n } },
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        new ActionView({
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
      const delegate = new Delegate({
        epochIndex: 0n,
        delegationAmount: { hi: 123n, lo: 456n },
      });
      const actionPlan = new ActionPlan({
        action: {
          case: 'delegate',
          value: delegate,
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        new ActionView({
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
      const undelegate = new Undelegate({
        startEpochIndex: 0n,
        delegationAmount: { hi: 123n, lo: 456n },
      });
      const actionPlan = new ActionPlan({
        action: {
          case: 'undelegate',
          value: undelegate,
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        new ActionView({
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
      const schedule = new ActionDutchAuctionSchedule({
        description: {
          input: {
            amount: { hi: 0n, lo: 1n },
            assetId: {},
          },
          outputId: {},
        },
      });
      const actionPlan = new ActionPlan({
        action: {
          case: 'actionDutchAuctionSchedule',
          value: schedule,
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        new ActionView({
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
      const withdraw = new ActionDutchAuctionWithdrawPlan({
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
      const actionPlan = new ActionPlan({
        action: {
          case: 'actionDutchAuctionWithdraw',
          value: withdraw,
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        new ActionView({
          actionView: {
            case: 'actionDutchAuctionWithdraw',
            value: {
              action: withdraw,
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
      const actionPlan = new ActionPlan({
        action: {
          case: 'proposalSubmit',
          value: {},
        },
      });

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

      await expect(actionView).resolves.toEqual(
        new ActionView({
          actionView: {
            case: 'proposalSubmit',
            value: {},
          },
        }),
      );
    });
  });
});
