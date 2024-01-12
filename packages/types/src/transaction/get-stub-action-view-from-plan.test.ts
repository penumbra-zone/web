import { describe, expect, test } from 'vitest';
import { getStubActionViewFromPlan } from './get-stub-action-view-from-plan';
import { ActionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

describe('getStubActionViewFromPlan()', () => {
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

      expect(() => getStubActionViewFromPlan(actionPlan)).toThrow('No address in action plan');
    });
  });
});
