import { describe, expect, test } from 'vitest';
import { viewActionPlan } from './view-action-plan';
import {
  ActionPlan,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  OutputView,
  OutputView_Visible,
  SpendView,
  SpendView_Visible,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import {
  AssetId,
  DenomMetadata,
  ValueView_KnownDenom,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { Jsonified } from '../../jsonified';
import { bech32AssetId } from '../../asset';

describe('viewActionPlan()', () => {
  const address =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const assetId = new AssetId({ inner: new Uint8Array() });
  const assetIdAsString = bech32AssetId(assetId);
  const denomMetadata = new DenomMetadata({ penumbraAssetId: assetId });
  const metadataByAssetId = {
    [assetIdAsString]: denomMetadata.toJson() as Jsonified<DenomMetadata>,
  };

  describe('`spend` action', () => {
    const validSpendActionPlan = new ActionPlan({
      action: {
        case: 'spend',
        value: {
          note: {
            address: { altBech32m: address },
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

      expect(() => viewActionPlan({})(actionPlan)).toThrow('No address in spend plan');
    });

    test('includes the amount', () => {
      const actionView = viewActionPlan(metadataByAssetId)(validSpendActionPlan);
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
              address: { altBech32m: address },
            },
          },
        },
      });

      expect(() => viewActionPlan({})(actionPlan)).toThrow('No value in note');
    });

    test('includes the denom metadata', () => {
      const actionView = viewActionPlan(metadataByAssetId)(validSpendActionPlan);
      const spendView = actionView.actionView.value as SpendView;
      const spendViewVisible = spendView.spendView.value as SpendView_Visible;
      const valueView = spendViewVisible.note!.value?.valueView.value as ValueView_KnownDenom;

      expect(valueView.denom?.toJson()).toEqual(denomMetadata.toJson());
    });

    test('throws if the asset ID is missing', () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'spend',
          value: {
            note: {
              address: { altBech32m: address },
              value: { amount: { hi: 1n, lo: 0n } },
            },
          },
        },
      });

      expect(() => viewActionPlan({})(actionPlan)).toThrow('No asset ID in value');
    });

    test('throws if the asset ID refers to an unknown asset type', () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'spend',
          value: {
            note: {
              address: { altBech32m: address },
              value: { amount: { hi: 1n, lo: 0n }, assetId: { altBech32m: 'invalid' } },
            },
          },
        },
      });

      expect(() => viewActionPlan({})(actionPlan)).toThrow(
        'Asset ID in spend plan refers to an unknown asset type',
      );
    });
  });

  describe('`output` action', () => {
    const destAddress = new Address({ altBech32m: address });
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
      const actionView = viewActionPlan(metadataByAssetId)(validOutputActionPlan);
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

      expect(() => viewActionPlan({})(actionPlan)).toThrow('No destAddress in output plan');
    });

    test('includes the amount', () => {
      const actionView = viewActionPlan(metadataByAssetId)(validOutputActionPlan);
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

      expect(() => viewActionPlan({})(actionPlan)).toThrow('No value to view');
    });

    test('includes the denom metadata', () => {
      const actionView = viewActionPlan(metadataByAssetId)(validOutputActionPlan);
      const outputView = actionView.actionView.value as OutputView;
      const outputViewVisible = outputView.outputView.value as OutputView_Visible;
      const valueView = outputViewVisible.note!.value?.valueView.value as ValueView_KnownDenom;

      expect(valueView.denom?.toJson()).toEqual(denomMetadata.toJson());
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

      expect(() => viewActionPlan({})(actionPlan)).toThrow('No asset ID in value');
    });

    test('throws if the asset ID refers to an unknown asset type', () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'output',
          value: {
            value: {
              amount: { hi: 1n, lo: 0n },
              assetId: { altBech32m: 'invalid' },
            },
            destAddress,
          },
        },
      });

      expect(() => viewActionPlan({})(actionPlan)).toThrow(
        'Asset ID in spend plan refers to an unknown asset type',
      );
    });
  });

  describe('`withdrawal` action', () => {
    test('returns an action view with the `ics20Withdrawal` case and no value', () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'withdrawal',
          value: { amount: { hi: 1n, lo: 0n } },
        },
      });

      const actionView = viewActionPlan({})(actionPlan);

      expect(
        actionView.equals(
          new ActionView({
            actionView: {
              case: 'ics20Withdrawal',
              value: {},
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
          case: 'swap',
          value: { feeBlinding: new Uint8Array() },
        },
      });

      const actionView = viewActionPlan({})(actionPlan);

      expect(
        actionView.equals(
          new ActionView({
            actionView: {
              case: 'swap',
              value: {},
            },
          }),
        ),
      ).toBe(true);
    });
  });
});
