import { ActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import {
  OutputView,
  SpendView,
} from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ADDRESS_VIEW_DECODED } from './address-view';
import { PENUMBRA_VALUE_VIEW } from './value-view';

export const SpendAction = new ActionView({
  actionView: {
    case: 'spend',
    value: new SpendView({
      spendView: {
        case: 'visible',
        value: {
          note: {
            address: ADDRESS_VIEW_DECODED,
            value: PENUMBRA_VALUE_VIEW,
          },
        },
      },
    }),
  },
});

export const OutputAction = new ActionView({
  actionView: {
    case: 'output',
    value: new OutputView({
      outputView: {
        case: 'visible',
        value: {
          note: {
            address: ADDRESS_VIEW_DECODED,
            value: PENUMBRA_VALUE_VIEW,
          },
        },
      },
    }),
  },
});
