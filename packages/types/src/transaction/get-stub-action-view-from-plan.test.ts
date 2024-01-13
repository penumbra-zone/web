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
  ValueView_KnownDenom,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { uint8ArrayToBase64 } from '../base64';

describe('getStubActionViewFromPlan()', () => {
  const address =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const assetId = new AssetId({ inner: new Uint8Array() });
  const base64AssetId = uint8ArrayToBase64(assetId.inner);
  const denomMetadata = new DenomMetadata({ penumbraAssetId: assetId });
  const metadataByAssetId = { [base64AssetId]: denomMetadata.toJson() };

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

      expect(() => getStubActionViewFromPlan({})(actionPlan)).toThrow('No address in spend plan');
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

      expect(() => getStubActionViewFromPlan({})(actionPlan)).toThrow('No value in note');
    });

    test('includes the denom metadata', () => {
      const actionView = getStubActionViewFromPlan(metadataByAssetId)(validSpendActionPlan);
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

      expect(() => getStubActionViewFromPlan({})(actionPlan)).toThrow('No asset ID in value');
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

      expect(() => getStubActionViewFromPlan({})(actionPlan)).toThrow(
        'Asset ID in spend plan refers to an unknown asset type',
      );
    });
  });
});
