import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ActionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { isControlledAddress } from '@penumbra-zone/wasm/address';

export const assertValidActionPlans = (fvk: FullViewingKey, actions?: ActionPlan[]) => {
  if (!actions?.length) {
    throw new ReferenceError('No action plans.', { cause: actions });
  }

  for (const actionPlan of actions) {
    assertValidActionPlan(fvk, actionPlan);
  }
};

const assertValidActionPlan = (fvk: FullViewingKey, { action }: ActionPlan) => {
  switch (action.case) {
    case undefined:
      throw new ReferenceError('Incomplete action plan', { cause: action });

    case 'swap':
      if (!isControlledAddress(fvk, action.value.swapPlaintext?.claimAddress)) {
        throw new Error('Uncontrolled swap claim address', {
          cause: action.value.swapPlaintext?.claimAddress,
        });
      }
      return;

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
    case 'output':
    case 'positionClose':
    case 'positionOpen':
    case 'positionRewardClaim':
    case 'positionWithdraw':
    case 'proposalDepositClaim':
    case 'proposalSubmit':
    case 'proposalWithdraw':
    case 'spend':
    case 'swapClaim':
    case 'undelegate':
    case 'undelegateClaim':
    case 'validatorDefinition':
    case 'validatorVote':
      // no specific assertions
      return;

    // do not add a default case.
  }

  // @ts-expect-error -- if this is no longer unreachable, the `ActionPlan` type
  // has changed. consider validation of the new type members, and update the
  // switch to be exhaustive again.
  throw new TypeError('Unknown action plan', { cause: action });
};
