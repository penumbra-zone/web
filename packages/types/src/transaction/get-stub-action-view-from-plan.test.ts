import { describe, expect, test } from 'vitest';
import { getStubActionViewFromPlan } from './get-stub-action-view-from-plan';
import { ActionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  SpendView,
  SpendView_Visible,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

describe('getStubActionViewFromPlan()', () => {
  const address =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const assetId = new AssetId({ altBech32m: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' });
  const denomMetadata = new DenomMetadata({ penumbraAssetId: assetId });
  const metadataByAssetId = new Map([[assetId, denomMetadata]]);

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

      expect(() => getStubActionViewFromPlan(new Map())(actionPlan)).toThrow(
        'No address in spend plan',
      );
    });

    test('includes the amount', () => {
      const actionView = getStubActionViewFromPlan(metadataByAssetId)(validSpendActionPlan);
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

      expect(() => getStubActionViewFromPlan(new Map())(actionPlan)).toThrow(
        'No amount in spend plan',
      );
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

      expect(() => getStubActionViewFromPlan(new Map())(actionPlan)).toThrow(
        'No asset ID in spend plan',
      );
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

      expect(() => getStubActionViewFromPlan(new Map())(actionPlan)).toThrow(
        'Asset ID in spend plan refers to an unknown asset type',
      );
    });
  });
});
