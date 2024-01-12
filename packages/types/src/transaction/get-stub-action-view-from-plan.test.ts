import { describe, expect, test } from 'vitest';
import { getStubActionViewFromPlan } from './get-stub-action-view-from-plan';
import { ActionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

describe('getStubActionViewFromPlan()', () => {
  const address =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';

  describe('`spend` action', () => {
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

      expect(() => getStubActionViewFromPlan({})(actionPlan)).toThrow('No amount in spend plan');
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

      expect(() => getStubActionViewFromPlan({})(actionPlan)).toThrow('No asset ID in spend plan');
    });
  });
});
