import {
  TransactionSummary,
  TransactionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { Balance, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ADDRESS1_VIEW_DECODED, ADDRESS_VIEW_DECODED } from './address-view';
import { PENUMBRA_METADATA, USDC_METADATA } from './metadata';
import { AMOUNT_123_456_789, AMOUNT_999 } from './amount';
import {
  SwapAction,
  IbcRelayMsgUpdateClientAction,
  IbcRelayMsgRecvPacketAction,
} from './action-view';

export const TxSummary = new TransactionSummary({
  effects: [
    {
      address: ADDRESS_VIEW_DECODED,
      balance: new Balance({
        values: [
          {
            negated: true,
            value: new Value({
              amount: AMOUNT_999,
              assetId: USDC_METADATA.penumbraAssetId,
            }),
          },
          {
            negated: false,
            value: new Value({
              amount: AMOUNT_999,
              assetId: PENUMBRA_METADATA.penumbraAssetId,
            }),
          },
        ],
      }),
    },
  ],
});

// Swap: 999 uUSDC -> 0 Penumbra
export const TxSwap = new TransactionInfo({
  view: new TransactionView({
    bodyView: {
      actionViews: [SwapAction],
    },
  }),
  summary: TxSummary,
});

// IBC deposit: 0.5 OSMO
export const TxIbcRelay = new TransactionInfo({
  height: 3729031n,
  view: {
    bodyView: {
      memoView: {
        memoView: {
          case: 'visible',
          value: {
            plaintext: {
              returnAddress: ADDRESS_VIEW_DECODED,
              text: 'From my Keplr wallet',
            },
          },
        },
      },
      actionViews: [IbcRelayMsgUpdateClientAction, IbcRelayMsgRecvPacketAction],
    },
  },
});

// Inner transfer from opaque address to a decoded address
export const TxReceive = new TransactionInfo({
  view: TransactionView.fromJson({
    bodyView: {
      actionViews: [
        {
          spend: {
            opaque: {
              spend: {
                body: {
                  balanceCommitment: {
                    inner: 'WLuSykAbmrlmU0vZp7jI5Y8lKk4BLrKmStxKu3lQ9Qo=',
                  },
                },
              },
            },
          },
        },
        {
          spend: {
            opaque: {
              spend: {
                body: {
                  balanceCommitment: {
                    inner: 'BPkDBgJlLB1Rcm9tUxMg96WU6iX6cYjxFoauYbRNYgk=',
                  },
                },
              },
            },
          },
        },
        {
          output: {
            visible: {
              note: {
                value: {
                  knownAssetId: {
                    amount: {
                      lo: '1900000',
                    },
                    metadata: PENUMBRA_METADATA.toJson(),
                  },
                },
                address: ADDRESS1_VIEW_DECODED.toJson(),
              },
            },
          },
        },
        {
          output: {
            opaque: {
              output: {
                body: {
                  balanceCommitment: {
                    inner: 'zrQu7ur3LNH6OqiEmS0Zg75YsoX1+4hoKIrSTrFavQI=',
                  },
                },
              },
            },
          },
        },
      ],
      transactionParameters: {
        chainId: 'penumbra-1',
        fee: {
          amount: {
            lo: '1013',
          },
        },
      },
      memoView: {
        visible: {
          plaintext: {
            text: 'Welcome to Penumbra! 🌗',
            returnAddress: {
              opaque: {
                address: {
                  inner:
                    '/QcI99iWWEoppooVTGEK2fvmSKVoqmx8vD8wfgx82NZxikBjgUA01E8j1XqdkrjbQ2OcslLElBz1XkY14BidEBiynrWbUf+GQdcPYyIybRc=',
                },
              },
            },
          },
        },
      },
    },
  }),
  summary: new TransactionSummary({
    effects: [
      {
        address: ADDRESS1_VIEW_DECODED,
        balance: new Balance({
          values: [
            {
              negated: false,
              value: new Value({
                amount: AMOUNT_123_456_789,
                assetId: PENUMBRA_METADATA.penumbraAssetId,
              }),
            },
          ],
        }),
      },
    ],
  }),
});
