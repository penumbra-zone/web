import {
  Action,
  ActionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import {
  OutputView,
  OutputView_Opaque,
  SpendView,
  SpendView_Opaque,
} from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  DelegatorVoteView,
  DelegatorVoteView_Opaque,
} from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import {
  SwapClaimView,
  SwapClaimView_Opaque,
  SwapView,
  SwapView_Opaque,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import {
  ActionDutchAuctionScheduleView,
  ActionDutchAuctionWithdrawView,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { ActionLiquidityTournamentVoteView_Opaque } from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';

/**
 * Convert an Action (a public view from Tendermint) to an opaque ActionView (a public view from Penumbra).
 * TODO: move this to `@penumbra-zone/perspective`.
 */
export const asActionView = (action?: Action): ActionView | undefined => {
  if (!action?.action) {
    return undefined;
  }

  const { case: actionCase, value } = action.action;

  switch (actionCase) {
    case 'spend':
      return new ActionView({
        actionView: {
          case: 'spend',
          value: new SpendView({
            spendView: {
              case: 'opaque',
              value: new SpendView_Opaque({
                spend: value,
              }),
            },
          }),
        },
      });

    case 'output':
      return new ActionView({
        actionView: {
          case: 'output',
          value: new OutputView({
            outputView: {
              case: 'opaque',
              value: new OutputView_Opaque({
                output: value,
              }),
            },
          }),
        },
      });

    case 'swap':
      return new ActionView({
        actionView: {
          case: 'swap',
          value: new SwapView({
            swapView: {
              case: 'opaque',
              value: new SwapView_Opaque({
                swap: value,
              }),
            },
          }),
        },
      });

    case 'swapClaim':
      return new ActionView({
        actionView: {
          case: 'swapClaim',
          value: new SwapClaimView({
            swapClaimView: {
              case: 'opaque',
              value: new SwapClaimView_Opaque({
                swapClaim: value,
              }),
            },
          }),
        },
      });

    case 'delegatorVote':
      return new ActionView({
        actionView: {
          case: actionCase,
          value: new DelegatorVoteView({
            delegatorVote: {
              case: 'opaque',
              value: new DelegatorVoteView_Opaque({
                delegatorVote: value,
              }),
            },
          }),
        },
      });

    case 'validatorDefinition':
      return new ActionView({
        actionView: {
          case: 'validatorDefinition',
          value,
        },
      });

    case 'ibcRelayAction':
      return new ActionView({
        actionView: {
          case: 'ibcRelayAction',
          value,
        },
      });

    case 'proposalSubmit':
      return new ActionView({
        actionView: {
          case: 'proposalSubmit',
          value,
        },
      });

    case 'proposalWithdraw':
      return new ActionView({
        actionView: {
          case: 'proposalWithdraw',
          value,
        },
      });

    case 'proposalDepositClaim':
      return new ActionView({
        actionView: {
          case: 'proposalDepositClaim',
          value,
        },
      });

    case 'validatorVote':
      return new ActionView({
        actionView: {
          case: 'validatorVote',
          value,
        },
      });

    case 'positionOpen':
      return new ActionView({
        actionView: {
          case: 'positionOpen',
          value,
        },
      });

    case 'positionClose':
      return new ActionView({
        actionView: {
          case: 'positionClose',
          value,
        },
      });

    case 'positionWithdraw':
      return new ActionView({
        actionView: {
          case: 'positionWithdraw',
          value,
        },
      });

    case 'positionRewardClaim':
      return new ActionView({
        actionView: {
          case: 'positionRewardClaim',
          value,
        },
      });

    case 'delegate':
      return new ActionView({
        actionView: {
          case: 'delegate',
          value,
        },
      });

    case 'undelegate':
      return new ActionView({
        actionView: {
          case: 'undelegate',
          value,
        },
      });

    case 'communityPoolSpend':
      return new ActionView({
        actionView: {
          case: 'communityPoolSpend',
          value,
        },
      });

    case 'communityPoolOutput':
      return new ActionView({
        actionView: {
          case: 'communityPoolOutput',
          value,
        },
      });

    case 'communityPoolDeposit':
      return new ActionView({
        actionView: {
          case: 'communityPoolDeposit',
          value,
        },
      });

    case 'actionDutchAuctionSchedule':
      return new ActionView({
        actionView: {
          case: 'actionDutchAuctionSchedule',
          value: new ActionDutchAuctionScheduleView({
            action: value,
          }),
        },
      });

    case 'actionDutchAuctionWithdraw':
      return new ActionView({
        actionView: {
          case: 'actionDutchAuctionWithdraw',
          value: new ActionDutchAuctionWithdrawView({
            action: value,
          }),
        },
      });

    case 'actionDutchAuctionEnd':
      return new ActionView({
        actionView: {
          case: 'actionDutchAuctionEnd',
          value,
        },
      });

    case 'undelegateClaim':
      return new ActionView({
        actionView: {
          case: 'undelegateClaim',
          value,
        },
      });

    case 'ics20Withdrawal':
      return new ActionView({
        actionView: {
          case: 'ics20Withdrawal',
          value,
        },
      });

    case 'actionLiquidityTournamentVote':
      return new ActionView({
        actionView: {
          case: 'actionLiquidityTournamentVote',
          value: {
            liquidityTournamentVote: {
              case: 'opaque',
              value: new ActionLiquidityTournamentVoteView_Opaque({
                vote: value,
              }),
            },
          },
        },
      });

    default:
      return undefined;
  }
};
