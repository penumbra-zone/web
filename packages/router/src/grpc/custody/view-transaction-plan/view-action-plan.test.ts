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
  ValueView_KnownAssetId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Jsonified } from '@penumbra-zone/types';
import { bech32AssetId } from '@penumbra-zone/types/src/asset';
import { bech32ToUint8Array } from '@penumbra-zone/types/src/address';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

describe('viewActionPlan()', () => {
  const addressAsBech32 =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const address = { inner: bech32ToUint8Array(addressAsBech32) };
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

    test('throws if the asset ID refers to an unknown asset type', () => {
      const actionPlan = new ActionPlan({
        action: {
          case: 'spend',
          value: {
            note: {
              address,
              value: { amount: { hi: 1n, lo: 0n }, assetId: { altBech32m: 'invalid' } },
            },
          },
        },
      });

      expect(() => viewActionPlan({}, mockFvk)(actionPlan)).toThrow(
        'Asset ID refers to an unknown asset type',
      );
    });
  });

  describe('`output` action', () => {
    const addressAsBech32 =
      'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
    const destAddress = new Address({ inner: bech32ToUint8Array(addressAsBech32) });
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

      expect(() => viewActionPlan({}, mockFvk)(actionPlan)).toThrow(
        'Asset ID refers to an unknown asset type',
      );
    });
  });

  describe('`withdrawal` action', () => {
    test('returns an action view with the `ics20Withdrawal` case and no value', () => {
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

      const actionView = viewActionPlan({}, mockFvk)(actionPlan);

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
