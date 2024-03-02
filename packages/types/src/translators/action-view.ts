import { ActionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { Translator } from './types';
import { asOpaqueSpendView } from './spend-view';
import { asOpaqueOutputView, asReceiverOutputView } from './output-view';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

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

    case 'delegate':
    case 'undelegate':
      return actionView;

    default:
      return new ActionView({
        actionView: actionView?.actionView.case
          ? {
              case: actionView.actionView.case,
              value: {},
            }
          : { case: undefined },
      });
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
