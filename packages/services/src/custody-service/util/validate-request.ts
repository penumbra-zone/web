import { PlainMessage } from '@bufbuild/protobuf';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { Address, FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ActionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { isControlledAddress } from '@penumbra-zone/wasm/address';
import { actionCountsInit } from './action-counts.js';
import { isZeroBytes } from './zero-bytes.js';

/** Assert specific features for some plans. */
export const assertValidActionPlans = (
  fvk: FullViewingKey,
  actions: PlainMessage<ActionPlan>[] | undefined,
): Record<NonNullable<ActionPlan['action']['case']>, number> => {
  const actionCounts = { ...actionCountsInit };

  if (!actions?.length) {
    throw new ReferenceError('No actions planned', { cause: actions });
  }

  for (const actionPlan of actions) {
    if (assertValidActionPlan(fvk, actionPlan)) {
      actionCounts[actionPlan.action.case]++;
    }
  }

  return actionCounts;
};

const assertValidActionPlan = (
  fvk: FullViewingKey,
  actionPlan: PlainMessage<ActionPlan>,
): actionPlan is PlainMessage<ActionPlan> & { action: { case: string } } => {
  const { action } = actionPlan;
  if (action.value == null) {
    throw new ReferenceError('Missing action plan', { cause: action });
  }

  /* eslint default-case: ["error"] -- explicitly require a default case for handling unexpected input */
  /* eslint @typescript-eslint/switch-exhaustiveness-check: ["error", { allowDefaultCaseForExhaustiveSwitch: true, considerDefaultExhaustiveForUnions: false }] -- explicitly mention every action type */
  switch (action.case) {
    /**
     * minimal sanity check: output destination address is present and valid
     */
    case 'output':
      {
        if (!action.value.destAddress || isZeroBytes(action.value.destAddress.inner)) {
          throw new ReferenceError('Missing output destination address');
        }

        try {
          bech32mAddress(action.value.destAddress);
        } catch (invalidAddress) {
          throw new TypeError('Invalid output destination address', { cause: action });
        }
      }
      return true;

    /**
     * swaps are followed by a swapClaim to deliver the outputs. the swap plan
     * specifies the claim address in advance.
     *
     * the swap plan is an external input, created by some frontend dapp.  any
     * output address may be planned, but most users will probably never want
     * their swap outputs to be delivered to somebody else.  so the claim
     * address is inspected to confirm that it's not someone else's address.
     */
    case 'swap':
      {
        if (
          !action.value.swapPlaintext?.claimAddress ||
          isZeroBytes(action.value.swapPlaintext.claimAddress.inner)
        ) {
          throw new ReferenceError('Missing swap claim address', { cause: action });
        }

        let bech32mClaimAddress: string;
        try {
          bech32mClaimAddress = bech32mAddress(action.value.swapPlaintext.claimAddress);
        } catch (invalidAddress) {
          throw new TypeError('Invalid swap claim address', { cause: action });
        }

        if (!isControlledAddress(fvk, new Address(action.value.swapPlaintext.claimAddress))) {
          throw new Error(`Uncontrolled swap claim address ${bech32mClaimAddress}`, {
            cause: action,
          });
        }
      }
      return true;

    /**
     * for convenience, swapClaims support a unique feature: they may be issued
     * without authorization by the spend key, because the swap has specified
     * the claim address in advance.  so, a swapClaim should not be authorized.
     */
    case 'swapClaim':
      throw new TypeError('Swap claims do not require authorization.');

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
    case 'spend':
    case 'undelegate':
    case 'undelegateClaim':
    case 'validatorDefinition':
    case 'validatorVote':
      // no specific assertions
      if (!Object.values(action.value).some(v => v != null)) {
        throw new TypeError('Missing action plan', { cause: action });
      }
      return true;

    default:
      action satisfies never;
      throw new TypeError('Unknown action plan', { cause: action });
  }
};
