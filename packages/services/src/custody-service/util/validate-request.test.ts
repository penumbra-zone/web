/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- test file */
import { ActionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { generateSpendKey, getAddressByIndex, getFullViewingKey } from '@penumbra-zone/wasm/keys';
import { afterAll, describe, expect, it } from 'vitest';
import { actionCountsInit } from './action-counts.js';
import { assertValidActionPlans } from './validate-request.js';

const currentUserSeedPhrase =
  'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';
const currentUserFullViewingKey = getFullViewingKey(generateSpendKey(currentUserSeedPhrase));
const currentUserAddress = getAddressByIndex(currentUserFullViewingKey, 1);

const otherUserSeedPhrase =
  'cancel tilt shallow way roast utility profit satoshi mushroom seek shift helmet';
const otherUserAddress = getAddressByIndex(
  getFullViewingKey(generateSpendKey(otherUserSeedPhrase)),
  1,
);

describe('individual plans', () => {
  it('rejects an empty action plan', () => {
    const emptyActionPlan = new ActionPlan({});
    expect(() => assertValidActionPlans(currentUserFullViewingKey, [emptyActionPlan])).toThrow(
      'Missing action plan',
    );
  });

  it('rejects an action missing a value', () => {
    const planMissingValue = new ActionPlan({});
    planMissingValue.action.case = 'spend';
    expect(() => assertValidActionPlans(currentUserFullViewingKey, [planMissingValue])).toThrow(
      'Missing action plan',
    );
  });

  it('rejects an action missing a case', () => {
    const planMissingCase = new ActionPlan({});
    planMissingCase.action.value = {} as any;
    planMissingCase.action.case = undefined;

    expect(() => assertValidActionPlans(currentUserFullViewingKey, [planMissingCase])).toThrow(
      'Unknown action plan',
    );
  });

  it('rejects an action with some unknown case', () => {
    const planUnknownCase = new ActionPlan({});
    planUnknownCase.action.value = {} as any;
    planUnknownCase.action.case = 'notValid' as ActionPlan['action']['case'];
    expect(() => assertValidActionPlans(currentUserFullViewingKey, [planUnknownCase])).toThrow(
      'Unknown action plan',
    );
  });

  describe('swap actions', () => {
    it('does not reject when the swap claim address is controlled', () => {
      const swapWithCurrentUserAddress = new ActionPlan({
        action: {
          case: 'swap',
          value: {
            swapPlaintext: { claimAddress: currentUserAddress },
          },
        },
      });

      expect(() =>
        assertValidActionPlans(currentUserFullViewingKey, [swapWithCurrentUserAddress]),
      ).not.toThrow();
    });

    it('rejects when the swap claim address is not controlled', () => {
      const swapWithOtherUserAddress = new ActionPlan({
        action: {
          case: 'swap',
          value: {
            swapPlaintext: { claimAddress: otherUserAddress },
          },
        },
      });
      expect(() =>
        assertValidActionPlans(currentUserFullViewingKey, [swapWithOtherUserAddress]),
      ).toThrow('Uncontrolled swap claim address');
    });

    it('rejects when the swap claim address is undefined', () => {
      const swapWithUndefinedAddress = new ActionPlan({
        action: {
          case: 'swap',
          value: {
            swapPlaintext: {},
          },
        },
      });
      expect(() =>
        assertValidActionPlans(currentUserFullViewingKey, [swapWithUndefinedAddress]),
      ).toThrow('Missing swap claim address');
    });

    it('rejects when the swap claim address is all zeroes', () => {
      const swapWithWrongLengthClaimAddress = new ActionPlan({
        action: {
          case: 'swap',
          value: {
            swapPlaintext: {
              claimAddress: { inner: new Uint8Array(80).fill(0) },
            },
          },
        },
      });

      expect(() =>
        assertValidActionPlans(currentUserFullViewingKey, [swapWithWrongLengthClaimAddress]),
      ).toThrow('Missing swap claim address');
    });
  });

  describe('swapClaim actions', () => {
    it('rejects swapClaim actions which do not require authorization', () => {
      const swapClaimAction = new ActionPlan({
        action: {
          case: 'swapClaim',
          value: {},
        },
      });

      expect(() => assertValidActionPlans(currentUserFullViewingKey, [swapClaimAction])).toThrow(
        'Swap claims do not require authorization',
      );
    });
  });

  describe('output actions', () => {
    it.each([undefined, 0, 1, 80, 81])(
      `rejects when the output destination address is %s zeroes`,
      innerLength => {
        const destAddress =
          innerLength == null ? undefined : { inner: new Uint8Array(innerLength) };
        expect(() =>
          assertValidActionPlans(currentUserFullViewingKey, [
            new ActionPlan({
              action: {
                case: 'output',
                value: { destAddress },
              },
            }),
          ]),
        ).toThrow('Missing output destination address');
      },
    );

    it.each([
      { inner: currentUserAddress.inner.slice(1) },
      { inner: Uint8Array.from([...currentUserAddress.inner, 81]) },
    ])('rejects when the output destination address is invalid', destAddress => {
      expect(() =>
        assertValidActionPlans(currentUserFullViewingKey, [
          new ActionPlan({
            action: {
              case: 'output',
              value: { destAddress },
            },
          }),
        ]),
      ).toThrow('Invalid output destination address');
    });

    it('does not reject when the output destination address is nonzero', () => {
      const outputWithValidDestination = new ActionPlan({
        action: {
          case: 'output',
          value: {
            destAddress: { inner: new Uint8Array(80).fill(3) },
          },
        },
      });

      expect(() =>
        assertValidActionPlans(currentUserFullViewingKey, [outputWithValidDestination]),
      ).not.toThrow();
    });
  });

  describe('validates the expected action types', () => {
    const actionCounts = { ...actionCountsInit };

    const allActionTypes = Object.keys(actionCounts) as (keyof typeof actionCounts)[];
    const validatedActionTypes = ['output', 'swap', 'swapClaim'] as (keyof typeof actionCounts)[];

    let testedValidations = 0;
    let testedNoValidations = 0;

    it.each(allActionTypes)('handles %s', actionType => {
      actionCounts[actionType]++;

      const invalidPlan = new ActionPlan({});
      invalidPlan.action.case = actionType;
      invalidPlan.action.value = { lol: 'invalid' } as any;

      if (validatedActionTypes.includes(actionType)) {
        expect(() => assertValidActionPlans(currentUserFullViewingKey, [invalidPlan])).toThrow();
      } else {
        expect(() =>
          assertValidActionPlans(currentUserFullViewingKey, [invalidPlan]),
        ).not.toThrow();
      }

      /* eslint default-case: ["error"] -- explicitly require the default case */
      /* eslint @typescript-eslint/switch-exhaustiveness-check: ["error", { allowDefaultCaseForExhaustiveSwitch: true, considerDefaultExhaustiveForUnions: false }] -- explicitly mention every action type */
      switch (actionType) {
        case 'output':
        case 'swap':
        case 'swapClaim':
          testedValidations++;
          break;

        case 'actionDutchAuctionEnd':
        case 'actionDutchAuctionSchedule':
        case 'actionDutchAuctionWithdraw':
        case 'actionLiquidityTournamentVote':
        case 'communityPoolDeposit':
        case 'communityPoolOutput':
        case 'communityPoolSpend':
        case 'delegate':
        case 'delegatorVote':
        case 'ibcRelayAction':
        case 'ics20Withdrawal':
        case 'positionClose':
        case 'positionOpen':
        case 'positionRewardClaim':
        case 'positionWithdraw':
        case 'proposalDepositClaim':
        case 'proposalSubmit':
        case 'proposalWithdraw':
        case 'undelegate':
        case 'undelegateClaim':
        case 'spend':
        case 'validatorDefinition':
        case 'validatorVote':
          testedNoValidations++;
          break;

        default:
          actionType satisfies never;
          expect.unreachable('Unexpected action type in test');
      }
    });

    afterAll(() => {
      expect(Object.values(actionCounts).every(i => i === 1)).toBe(true);
      expect(Object.values(actionCounts).length).toBe(testedValidations + testedNoValidations);
    });
  });
});

describe('lists of plans', () => {
  it('rejects when no actions are provided', () => {
    expect(() => assertValidActionPlans(currentUserFullViewingKey, [])).toThrow(
      'No actions planned',
    );
    expect(() => assertValidActionPlans(currentUserFullViewingKey, undefined)).toThrow(
      'No actions planned',
    );
  });

  it('validates all actions', () => {
    expect(() =>
      assertValidActionPlans(currentUserFullViewingKey, [
        new ActionPlan({
          action: {
            case: 'spend',
            value: {},
          },
        }),
        new ActionPlan({
          action: {
            case: 'delegate',
            value: {},
          },
        }),
      ]),
    ).not.toThrow();

    expect(() =>
      assertValidActionPlans(currentUserFullViewingKey, [
        new ActionPlan({
          action: {
            case: 'spend',
            value: {},
          },
        }),
        new ActionPlan({
          action: {
            case: 'output',
            value: { destAddress: otherUserAddress },
          },
        }),
        new ActionPlan({
          action: {
            case: 'swap',
            value: {
              swapPlaintext: { claimAddress: otherUserAddress },
            },
          },
        }),
      ]),
    ).toThrow('Uncontrolled swap claim address');
  });
});
