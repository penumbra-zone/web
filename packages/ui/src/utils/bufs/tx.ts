import {
  TransactionSummarySchema,
  TransactionViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { create, fromJson, toJson } from '@bufbuild/protobuf';
import {
  BalanceSchema,
  MetadataSchema,
  ValueSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionInfoSchema } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AddressViewSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ADDRESS1_VIEW_DECODED, ADDRESS_VIEW_DECODED } from './address-view';
import { LPNFT_METADATA, PENUMBRA_METADATA, USDC_METADATA } from './metadata';
import { AMOUNT_123_456_789, AMOUNT_999 } from './amount';
import {
  SwapAction,
  IbcRelayMsgUpdateClientAction,
  IbcRelayMsgRecvPacketAction,
} from './action-view';
import { PENUMBRA_VALUE_VIEW, USDC_VALUE_VIEW } from './value-view';

export const TxSummary = create(TransactionSummarySchema, {
  effects: [
    {
      address: ADDRESS_VIEW_DECODED,
      balance: create(BalanceSchema, {
        values: [
          {
            negated: true,
            value: create(ValueSchema, {
              amount: AMOUNT_999,
              assetId: USDC_METADATA.penumbraAssetId,
            }),
          },
          {
            negated: false,
            value: create(ValueSchema, {
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
export const TxSwap = create(TransactionInfoSchema, {
  view: create(TransactionViewSchema, {
    bodyView: {
      actionViews: [SwapAction],
    },
  }),
  summary: TxSummary,
});

// IBC deposit: 0.5 OSMO
export const TxIbcRelay = create(TransactionInfoSchema, {
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
export const TxReceive = create(TransactionInfoSchema, {
  view: fromJson(TransactionViewSchema, {
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
                    metadata: toJson(MetadataSchema, PENUMBRA_METADATA),
                  },
                },
                address: toJson(AddressViewSchema, ADDRESS1_VIEW_DECODED),
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
  summary: create(TransactionSummarySchema, {
    effects: [
      {
        address: ADDRESS1_VIEW_DECODED,
        balance: create(BalanceSchema, {
          values: [
            {
              negated: false,
              value: create(ValueSchema, {
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
export const TxPositionOpen = create(TransactionInfoSchema, {
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
