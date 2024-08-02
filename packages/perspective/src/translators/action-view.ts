import { ActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { Translator } from './types.js';
import { asOpaqueSpendView } from './spend-view.js';
import { asOpaqueOutputView, asReceiverOutputView } from './output-view.js';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { asOpaqueSwapView } from './swap-view.js';
import { asOpaqueSwapClaimView } from './swap-claim-view.js';
import { asOpaqueDelegatorVoteView } from './delegator-vote-view.js';

export const asPublicActionView: Translator<ActionView> = actionView => {
  switch (actionView?.actionView.case) {
    case 'spend':
      return new ActionView({
        actionView: {
          case: 'spend',
          value: asOpaqueSpendView(actionView.actionView.value),
        },
      });

    case 'output':
      return new ActionView({
        actionView: {
          case: 'output',
          value: asOpaqueOutputView(actionView.actionView.value),
        },
      });

    case 'swap':
      return new ActionView({
        actionView: {
          case: 'swap',
          value: asOpaqueSwapView(actionView.actionView.value),
        },
      });

    case 'swapClaim':
      return new ActionView({
        actionView: {
          case: 'swapClaim',
          value: asOpaqueSwapClaimView(actionView.actionView.value),
        },
      });

    case 'delegatorVote':
      return new ActionView({
        actionView: {
          case: 'delegatorVote',
          value: asOpaqueDelegatorVoteView(actionView.actionView.value),
        },
      });

    // Currently defaulting to displaying that all data is public as it's better
    // to err on communicating private data as public than the other way around
    // TODO: Do proper audit of what data for each action is public
    default:
      return actionView!;
  }
};

export const asReceiverActionView: Translator<
  ActionView,
  Promise<ActionView>,
  { isControlledAddress: (address: Address) => Promise<boolean> }
> = async (actionView, ctx) => {
  switch (actionView?.actionView.case) {
    case 'output':
      return new ActionView({
        actionView: {
          case: 'output',
          value: await asReceiverOutputView(actionView.actionView.value, ctx),
        },
      });

    default:
      return asPublicActionView(actionView);
  }
};
