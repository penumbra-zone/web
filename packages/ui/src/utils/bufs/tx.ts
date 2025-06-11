import {
  TransactionSummary,
  TransactionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { Balance, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ADDRESS1_VIEW_DECODED, ADDRESS_VIEW_DECODED } from './address-view';
import {
  LPNFT_METADATA,
  PENUMBRA_METADATA,
  USDC_METADATA,
  OSMO_METADATA,
  DELEGATION_TOKEN_METADATA,
} from './metadata';
import { AMOUNT_123_456_789, AMOUNT_999 } from './amount';
import {
  SwapAction,
  IbcRelayMsgUpdateClientAction,
  OsmoIbcRelayMsgRecvPacketAction,
  DelegateAction,
} from './action-view';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { PENUMBRA_VALUE_VIEW, USDC_VALUE_VIEW } from './value-view';
import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

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

// Swap
export const TxSwap = new TransactionInfo({
  view: new TransactionView({
    bodyView: {
      actionViews: [SwapAction],
    },
  }),
  summary: new TransactionSummary({
    effects: [
      {
        address: ADDRESS_VIEW_DECODED,
        balance: new Balance({
          values: [
            {
              negated: true, // Spent USDC
              value: new Value({
                amount: { lo: 50000000000n, hi: 0n }, // 50 USDC
                assetId: USDC_METADATA.penumbraAssetId,
              }),
            },
            {
              negated: false, // Received UM
              value: new Value({
                amount: { lo: 12500000n, hi: 0n }, // 12.5 UM
                assetId: PENUMBRA_METADATA.penumbraAssetId,
              }),
            },
          ],
        }),
      },
    ],
  }),
});

// Delegation transaction
export const TxDelegate = new TransactionInfo({
  view: new TransactionView({
    bodyView: {
      actionViews: [DelegateAction],
    },
  }),
  summary: new TransactionSummary({
    effects: [
      {
        address: ADDRESS_VIEW_DECODED,
        balance: new Balance({
          values: [
            {
              negated: false, // Will show as negative UM (spent for delegation)
              value: new Value({
                amount: { lo: 10000000000n, hi: 0n }, // -10 UM
                assetId: PENUMBRA_METADATA.penumbraAssetId,
              }),
            },
            {
              negated: true, // Will show as positive delUM (received delegation tokens)
              value: new Value({
                amount: { lo: 9950000000n, hi: 0n }, // +9.95 delUM (slightly less due to fees/slashing protection)
                assetId: DELEGATION_TOKEN_METADATA.penumbraAssetId,
              }),
            },
          ],
        }),
      },
    ],
  }),
});

// Multi-asset transaction with address grouping
export const TxMultiAsset = new TransactionInfo({
  view: new TransactionView({
    bodyView: {
      actionViews: [SwapAction],
    },
  }),
  summary: new TransactionSummary({
    effects: [
      // First address - multiple assets
      {
        address: ADDRESS_VIEW_DECODED,
        balance: new Balance({
          values: [
            {
              negated: false,
              value: new Value({
                amount: { lo: 25000000n, hi: 0n }, // -25 USDC
                assetId: USDC_METADATA.penumbraAssetId,
              }),
            },
            {
              negated: false,
              value: new Value({
                amount: { lo: 150000000n, hi: 0n }, // -150 OSMO
                assetId: OSMO_METADATA.penumbraAssetId,
              }),
            },
            {
              negated: true,
              value: new Value({
                amount: { lo: 5000000000n, hi: 0n }, // +5 UM
                assetId: PENUMBRA_METADATA.penumbraAssetId,
              }),
            },
            {
              negated: true,
              value: new Value({
                amount: { lo: 2500000000n, hi: 0n }, // +2.5 delUM
                assetId: DELEGATION_TOKEN_METADATA.penumbraAssetId,
              }),
            },
          ],
        }),
      },
      // Second address - different assets (also >2 for ellipsis)
      {
        address: ADDRESS1_VIEW_DECODED,
        balance: new Balance({
          values: [
            {
              negated: true,
              value: new Value({
                amount: { lo: 10000000n, hi: 0n }, // -10 USDC
                assetId: USDC_METADATA.penumbraAssetId,
              }),
            },
            {
              negated: false,
              value: new Value({
                amount: { lo: 75000000n, hi: 0n }, // +75 OSMO
                assetId: OSMO_METADATA.penumbraAssetId,
              }),
            },
            {
              negated: false,
              value: new Value({
                amount: { lo: 1000000000n, hi: 0n }, // +1 UM
                assetId: PENUMBRA_METADATA.penumbraAssetId,
              }),
            },
          ],
        }),
      },
    ],
  }),
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
      actionViews: [IbcRelayMsgUpdateClientAction, OsmoIbcRelayMsgRecvPacketAction],
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

// USDC/UM Position with 1 LPNFT as an output
export const TxPositionOpen = new TransactionInfo({
  height: 3630671n,
  id: {
    inner: base64ToUint8Array('5/9XEqusVwsA3kqi18KhJ0pF8nYgb16YQLoSU88uFDU='),
  },
  view: {
    bodyView: {
      actionViews: [
        {
          actionView: {
            case: 'spend',
            value: {
              spendView: {
                case: 'visible',
                value: {
                  note: {
                    value: USDC_VALUE_VIEW,
                    address: ADDRESS_VIEW_DECODED,
                  },
                },
              },
            },
          },
        },
        {
          actionView: {
            case: 'spend',
            value: {
              spendView: {
                case: 'visible',
                value: {
                  note: {
                    value: PENUMBRA_VALUE_VIEW,
                    address: ADDRESS_VIEW_DECODED,
                  },
                },
              },
            },
          },
        },
        {
          actionView: {
            case: 'output',
            value: {
              outputView: {
                case: 'visible',
                value: {
                  note: {
                    value: {
                      valueView: {
                        case: 'knownAssetId',
                        value: {
                          metadata: LPNFT_METADATA,
                          amount: {
                            lo: 1n,
                            hi: 0n,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          actionView: {
            case: 'output',
            value: {
              outputView: {
                case: 'visible',
                value: {
                  note: {
                    value: {
                      valueView: {
                        case: 'knownAssetId',
                        value: {
                          metadata: LPNFT_METADATA,
                          amount: {
                            lo: 1n,
                            hi: 0n,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        {
          actionView: {
            case: 'positionOpen',
            value: {
              position: {
                phi: {
                  component: {
                    fee: 0,
                    p: {
                      lo: 20000000n,
                      hi: 0n,
                    },
                    q: {
                      lo: 13909833n,
                      hi: 0n,
                    },
                  },
                  pair: {
                    asset1: USDC_METADATA.penumbraAssetId,
                    asset2: PENUMBRA_METADATA.penumbraAssetId,
                  },
                },
                state: {
                  state: PositionState_PositionStateEnum.OPENED,
                  sequence: 0n,
                },
                reserves: {
                  r1: {
                    lo: 695492n,
                    hi: 0n,
                  },
                  r2: {
                    lo: 0n,
                    hi: 0n,
                  },
                },
                closeOnFill: true,
              },
            },
          },
        },
      ],
    },
  },
  summary: {
    effects: [
      {
        address: ADDRESS_VIEW_DECODED,
        balance: {
          values: [
            {
              negated: true,
              value: {
                assetId: LPNFT_METADATA.penumbraAssetId,
                amount: {
                  lo: 1n,
                  hi: 0n,
                },
              },
            },
            {
              negated: false,
              value: {
                assetId: USDC_METADATA.penumbraAssetId,
                amount: {
                  lo: 695492n,
                  hi: 0n,
                },
              },
            },
            {
              negated: false,
              value: {
                assetId: PENUMBRA_METADATA.penumbraAssetId,
                amount: {
                  lo: 1451n,
                  hi: 0n,
                },
              },
            },
          ],
        },
      },
    ],
  },
});
