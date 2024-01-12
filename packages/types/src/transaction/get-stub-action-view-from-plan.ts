import {
  ActionPlan,
  ActionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const getStubActionViewFromPlan = (actionPlan: ActionPlan): ActionView => {
  switch (actionPlan.action.case) {
    case 'spend':
      if (actionPlan.action.value.note?.address) throw new Error('Invalid address in action plan');

      return new ActionView({
        actionView: {
          case: 'spend',
          value: {
            spendView: {
              case: 'visible',
              value: {
                note: {
                  address: {
                    addressView: {
                      case: 'opaque',
                      value: { address: actionPlan.action.value.note!.address! },
                    },
                  },
                  value: {
                    // valueView: {
                    //   // case: '
                    // },
                  },
                },
              },
            },
          },
        },
      });
  }

  return new ActionView({});
};
