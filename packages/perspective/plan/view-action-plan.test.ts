import { describe, expect, test } from 'vitest';
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
  ValueView_KnownAssetId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  BatchSwapOutputData,
  SwapPlaintext,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { JsonObject } from '@bufbuild/protobuf';
import {
  Delegate,
  Undelegate,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { bech32AssetId } from '@penumbra-zone/bech32/src/asset';
import { bech32ToAddress } from '@penumbra-zone/bech32/src/address';
import type { Jsonified } from '@penumbra-zone/types/src/jsonified';

describe('viewActionPlan()', () => {
  const addressAsBech32 =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const address = new Address({ inner: bech32ToAddress(addressAsBech32) });
  const assetId = new AssetId({ inner: new Uint8Array() });
  const assetIdAsString = bech32AssetId(assetId);
  const metadata = new Metadata({ penumbraAssetId: assetId });
  const metadataByAssetId = {
    [assetIdAsString]: metadata.toJson() as Jsonified<Metadata>,
  };
  const mockFvk =
    'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09';

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

    test('throws if the address is missing', () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'spend',
          value: {
            note: {},
          },
        },
      });

      expect(() => viewActionPlan({}, mockFvk)(actionPlan)).toThrow('No address in spend plan');
    });

    test('includes the amount', () => {
      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(validSpendActionPlan);
      const spendView = actionView.actionView.value as SpendView;
      const spendViewVisible = spendView.spendView.value as SpendView_Visible;

      expect(spendViewVisible.note!.value?.valueView.value?.amount).toEqual({
        hi: 1n,
        lo: 0n,
      });
    });

    test('throws if the amount is missing', () => {
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

      expect(() => viewActionPlan({}, mockFvk)(actionPlan)).toThrow('No value in note');
    });

    test('includes the denom metadata', () => {
      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(validSpendActionPlan);
      const spendView = actionView.actionView.value as SpendView;
      const spendViewVisible = spendView.spendView.value as SpendView_Visible;
      const valueView = spendViewVisible.note!.value?.valueView.value as ValueView_KnownAssetId;

      expect(valueView.metadata?.toJson()).toEqual(metadata.toJson());
    });

    test('throws if the asset ID is missing', () => {
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

      expect(() => viewActionPlan({}, mockFvk)(actionPlan)).toThrow('No asset ID in value');
    });
  });

  describe('`output` action', () => {
    const addressAsBech32 =
      'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
    const destAddress = new Address({ inner: bech32ToAddress(addressAsBech32) });
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

    test('includes the destAddress', () => {
      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(validOutputActionPlan);
      const outputView = actionView.actionView.value as OutputView;
      const outputViewVisible = outputView.outputView.value as OutputView_Visible;

      expect(outputViewVisible.note?.address?.addressView.value?.address).toEqual(destAddress);
    });

    test('throws if the destAddress is missing', () => {
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

      expect(() => viewActionPlan({}, mockFvk)(actionPlan)).toThrow(
        'No destAddress in output plan',
      );
    });

    test('includes the amount', () => {
      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(validOutputActionPlan);
      const outputView = actionView.actionView.value as OutputView;
      const outputViewVisible = outputView.outputView.value as OutputView_Visible;

      expect(outputViewVisible.note?.value?.valueView.value?.amount).toEqual({
        hi: 1n,
        lo: 0n,
      });
    });

    test('throws if the amount is missing', () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'output',
          value: {
            destAddress,
          },
        },
      });

      expect(() => viewActionPlan({}, mockFvk)(actionPlan)).toThrow('No value to view');
    });

    test('includes the denom metadata', () => {
      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(validOutputActionPlan);
      const outputView = actionView.actionView.value as OutputView;
      const outputViewVisible = outputView.outputView.value as OutputView_Visible;
      const valueView = outputViewVisible.note!.value?.valueView.value as ValueView_KnownAssetId;

      expect(valueView.metadata?.toJson()).toEqual(metadata.toJson());
    });

    test('throws if the asset ID is missing', () => {
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

      expect(() => viewActionPlan({}, mockFvk)(actionPlan)).toThrow('No asset ID in value');
    });
  });

  describe('`swap` action', () => {
    test('returns an action view with the `swap` case', () => {
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

      const actionView = viewActionPlan({}, mockFvk)(actionPlan);

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
              },
            },
          },
        },
      });

      expect(actionView.equals(expected)).toBe(true);
    });
  });

  describe('`swapClaim` action', () => {
    test('returns an action view with the `swapClaim` case', () => {
      const asset1Id = new AssetId({ inner: new Uint8Array([0, 1, 2, 3]) });
      const asset2Id = new AssetId({ inner: new Uint8Array([4, 5, 6, 7]) });
      const asset1IdAsString = bech32AssetId(asset1Id);
      const asset2IdAsString = bech32AssetId(asset2Id);
      const metadataByAssetId = {
        [asset1IdAsString]: new Metadata({ penumbraAssetId: asset1Id }).toJson() as JsonObject,
        [asset2IdAsString]: new Metadata({ penumbraAssetId: asset2Id }).toJson() as JsonObject,
      };

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

      const actionView = viewActionPlan(metadataByAssetId, mockFvk)(actionPlan);

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
                        metadata: Metadata.fromJson(metadataByAssetId[asset1IdAsString]!),
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
                        metadata: Metadata.fromJson(metadataByAssetId[asset2IdAsString]!),
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
    test('returns an action view with the `ics20Withdrawal` case as-is', () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'ics20Withdrawal',
          value: { amount: { hi: 1n, lo: 0n } },
        },
      });

      const actionView = viewActionPlan({}, mockFvk)(actionPlan);

      expect(
        actionView.equals(
          new ActionView({
            actionView: {
              case: 'ics20Withdrawal',
              value: { amount: { hi: 1n, lo: 0n } },
            },
          }),
        ),
      ).toBe(true);
    });
  });

  describe('`delegate` action', () => {
    test('returns an action view with the action as-is', () => {
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

      const actionView = viewActionPlan({}, mockFvk)(actionPlan);

      expect(
        actionView.equals(
          new ActionView({
            actionView: {
              case: 'delegate',
              value: delegate,
            },
          }),
        ),
      ).toBe(true);
    });
  });

  describe('`undelegate` action', () => {
    test('returns an action view with the action as-is', () => {
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

      const actionView = viewActionPlan({}, mockFvk)(actionPlan);

      expect(
        actionView.equals(
          new ActionView({
            actionView: {
              case: 'undelegate',
              value: undelegate,
            },
          }),
        ),
      ).toBe(true);
    });
  });

  describe('all other action cases', () => {
    test('returns an action view with the case but no value', () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'proposalSubmit',
          value: {},
        },
      });

      const actionView = viewActionPlan({}, mockFvk)(actionPlan);

      expect(
        actionView.equals(
          new ActionView({
            actionView: {
              case: 'proposalSubmit',
              value: {},
            },
          }),
        ),
      ).toBe(true);
    });
  });
});
