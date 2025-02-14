import { ActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { SpendView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';

export const SpendAction = new ActionView({
  actionView: {
    case: 'spend',
    value: new SpendView({
      spendView: {
        case: 'visible',
        value: {
          note: {
            address: {
              addressView: {
                case: 'decoded',
                value: {
                  address: {
                    inner: Uint8Array.from([0, 1, 2, 3]),
                  },
                  index: {
                    account: 0,
                  },
                },
              },
            },
            value: {
              valueView: {
                case: 'unknownAssetId',
                value: {
                  amount: {
                    hi: 1n,
                    lo: 0n,
                  },
                  assetId: {
                    inner: Uint8Array.from([0, 1, 2, 3]),
                  },
                },
              },
            },
          },
          spend: {
            body: {
              balanceCommitment: {
                inner: Uint8Array.from([0, 1, 2, 3]),
              },
            },
          },
        },
      },
    }),
  },
});
