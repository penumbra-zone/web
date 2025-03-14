import { ActionViewSchema } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { create } from '@bufbuild/protobuf';
import {
  NoteViewSchema,
  OutputViewSchema,
  SpendViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';

import {
  PositionCloseSchema,
  PositionOpenSchema,
  PositionRewardClaimSchema,
  PositionWithdrawSchema,
  SwapClaimViewSchema,
  SwapViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

import { ADDRESS_VIEW_DECODED } from './address-view';
import { PENUMBRA_VALUE_VIEW, PENUMBRA_VALUE_VIEW_ZERO, USDC_VALUE_VIEW } from './value-view';
import { PENUMBRA_METADATA, USDC_METADATA } from './metadata';
import { AMOUNT_123_456_789, AMOUNT_999, AMOUNT_ZERO } from './amount';
import { TransactionIdSchema } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { FeeSchema } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { MsgUpdateClientSchema } from '@penumbra-zone/protobuf/ibc/core/client/v1/tx_pb';

import {
  MsgAcknowledgementSchema,
  MsgRecvPacketSchema,
  MsgTimeoutSchema,
  MsgTimeoutOnCloseSchema,
} from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';

import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { PacketSchema } from '@penumbra-zone/protobuf/ibc/core/channel/v1/channel_pb';
import { anyPack } from '@bufbuild/protobuf/wkt';

export const SpendAction = create(ActionViewSchema, {
  actionView: {
    case: 'spend',
    value: create(SpendViewSchema, {
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

export const SpendActionOpaque = create(ActionViewSchema, {
  actionView: {
    case: 'spend',
    value: create(SpendViewSchema, {
      spendView: {
        case: 'opaque',
        value: {},
      },
    }),
  },
});

export const OutputAction = create(ActionViewSchema, {
  actionView: {
    case: 'output',
    value: create(OutputViewSchema, {
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

export const OutputActionOpaque = create(ActionViewSchema, {
  actionView: {
    case: 'output',
    value: create(OutputViewSchema, {
      outputView: {
        case: 'opaque',
        value: {},
      },
    }),
  },
});

export const SwapAction = create(ActionViewSchema, {
  actionView: {
    case: 'swap',
    value: create(SwapViewSchema, {
      swapView: {
        case: 'visible',
        value: {
          claimTx: create(TransactionIdSchema, {
            inner: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          }),
          asset1Metadata: USDC_METADATA,
          asset2Metadata: PENUMBRA_METADATA,
          output1: create(NoteViewSchema, {
            address: ADDRESS_VIEW_DECODED,
            value: USDC_VALUE_VIEW,
          }),
          output2: create(NoteViewSchema, {
            address: ADDRESS_VIEW_DECODED,
            value: PENUMBRA_VALUE_VIEW_ZERO,
          }),
          swapPlaintext: {
            claimFee: create(FeeSchema, {
              amount: AMOUNT_999,
              assetId: PENUMBRA_METADATA.penumbraAssetId,
            }),
            delta1I: AMOUNT_123_456_789,
            delta2I: AMOUNT_ZERO,
          },
        },
      },
    }),
  },
});

export const SwapActionOpaque = create(ActionViewSchema, {
  actionView: {
    case: 'swap',
    value: create(SwapViewSchema, {
      swapView: {
        case: 'opaque',
        value: {
          asset1Metadata: USDC_METADATA,
          asset2Metadata: PENUMBRA_METADATA,
          output1Value: USDC_VALUE_VIEW,
          output2Value: PENUMBRA_VALUE_VIEW_ZERO,
          swap: {
            body: {
              delta1I: AMOUNT_123_456_789,
              delta2I: AMOUNT_ZERO,
            },
          },
        },
      },
    }),
  },
});

export const SwapClaimAction = create(ActionViewSchema, {
  actionView: {
    case: 'swapClaim',
    value: create(SwapClaimViewSchema, {
      swapClaimView: {
        case: 'visible',
        value: {
          output1: create(NoteViewSchema, {
            address: ADDRESS_VIEW_DECODED,
            value: USDC_VALUE_VIEW,
          }),
          output2: create(NoteViewSchema, {
            address: ADDRESS_VIEW_DECODED,
            value: PENUMBRA_VALUE_VIEW,
          }),
          swapTx: create(TransactionIdSchema, {
            inner: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          }),
          swapClaim: {
            body: {
              fee: create(FeeSchema, {
                amount: AMOUNT_999,
                assetId: PENUMBRA_METADATA.penumbraAssetId,
              }),
            },
          },
        },
      },
    }),
  },
});

export const SwapClaimActionOpaque = create(ActionViewSchema, {
  actionView: {
    case: 'swapClaim',
    value: create(SwapClaimViewSchema, {
      swapClaimView: {
        case: 'opaque',
        value: {
          swapClaim: {
            body: {
              fee: create(FeeSchema, {
                amount: AMOUNT_999,
                assetId: PENUMBRA_METADATA.penumbraAssetId,
              }),
              outputData: {
                tradingPair: {
                  asset1: USDC_METADATA.penumbraAssetId,
                  asset2: PENUMBRA_METADATA.penumbraAssetId,
                },
                lambda1: AMOUNT_123_456_789,
                lambda2: AMOUNT_999,
              },
            },
          },
        },
      },
    }),
  },
});

export const PositionOpenAction = create(ActionViewSchema, {
  actionView: {
    case: 'positionOpen',
    value: create(PositionOpenSchema, {
      position: {
        reserves: {
          r1: {
            lo: 695492n,
          },
          r2: {},
        },
        phi: {
          component: {
            fee: 3000000,
            p: {
              lo: 20000000n,
            },
            q: {
              lo: 13909833n,
            },
          },
          pair: {
            asset1: USDC_METADATA.penumbraAssetId,
            asset2: PENUMBRA_METADATA.penumbraAssetId,
          },
        },
      },
    }),
  },
});

export const PositionCloseAction = create(ActionViewSchema, {
  actionView: {
    case: 'positionClose',
    value: create(PositionCloseSchema, {
      positionId: {
        inner: new Uint8Array([
          0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5,
          6, 7,
        ]),
      },
    }),
  },
});

export const PositionWithdrawAction = create(ActionViewSchema, {
  actionView: {
    case: 'positionWithdraw',
    value: create(PositionWithdrawSchema, {
      positionId: {
        inner: new Uint8Array([
          0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5,
          6, 7,
        ]),
      },
    }),
  },
});

export const PositionRewardClaimAction = create(ActionViewSchema, {
  actionView: {
    case: 'positionRewardClaim',
    value: create(PositionRewardClaimSchema, {
      positionId: {
        inner: new Uint8Array([
          0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5,
          6, 7,
        ]),
      },
    }),
  },
});

//
// IBC actions
//

export const IbcRelayMsgUpdateClientAction = create(ActionViewSchema, {
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: anyPack(
        MsgUpdateClientSchema,
        create(MsgUpdateClientSchema, {
          clientId: '07-tendermint-4',
          signer: 'cosmos000000000000000000000000000000000000000',
        }),
      ),
    },
  },
});

const IbcPacket = create(PacketSchema, {
  sequence: 4480n,
  sourcePort: 'transfer',
  sourceChannel: 'channel-79703',
  destinationPort: 'transfer',
  destinationChannel: 'channel-4',
  // This data encodes FungibleTokenPacketData message
  data: base64ToUint8Array(
    'eyJhbW91bnQiOiI1MDAwMDAiLCJkZW5vbSI6InVvc21vIiwicmVjZWl2ZXIiOiJwZW51bWJyYTFzNHNzbWcyYXJ5d2pwd3BzdGs3ZWsydTZxNTd1emg5ajB1bWU3cXl0aDlhcW41a3lzZTR1NXA5NXQ1M25qNjMyNnA0cHZjcDR2NTJ2Z2RrdWRzc3pjdmp5bHNheDdyaGF6Z3UybjBuMnJxNmhzdHVxbnozd2s4cWZsa3JwdGxlbWZmMm55biIsInNlbmRlciI6Im9zbW8xejV0cDRhNTBxbjU5emp0OWM3ZGthMDgzNHo1bDNyc3lqcjJyNXIifQ==',
  ),
  timeoutTimestamp: 1740814200000000000n,
});

// An Ibc deposit of 0.5 OSMO
export const IbcRelayMsgRecvPacketAction = create(ActionViewSchema, {
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: anyPack(
        MsgRecvPacketSchema,
        create(MsgRecvPacketSchema, {
          signer: 'cosmos000000000000000000000000000000000000000',
          proofHeight: {
            revisionNumber: 1n,
            revisionHeight: 30444680n,
          },
          packet: IbcPacket,
        }),
      ),
    },
  },
});

export const IbcRelayMsgAcknowledgementAction = create(ActionViewSchema, {
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: anyPack(
        MsgAcknowledgementSchema,
        create(MsgAcknowledgementSchema, {
          signer: 'cosmos000000000000000000000000000000000000000',
          proofHeight: {
            revisionNumber: 1n,
            revisionHeight: 30444680n,
          },
          proofAcked: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          acknowledgement: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          packet: IbcPacket,
        }),
      ),
    },
  },
});

export const IbcRelayMsgTimeoutAction = create(ActionViewSchema, {
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: anyPack(
        MsgTimeoutSchema,
        create(MsgTimeoutSchema, {
          signer: 'cosmos000000000000000000000000000000000000000',
          proofHeight: {
            revisionNumber: 1n,
            revisionHeight: 30444680n,
          },
          packet: IbcPacket,
          nextSequenceRecv: 100n,
          proofUnreceived: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
        }),
      ),
    },
  },
});

export const IbcRelayMsgTimeoutOnCloseAction = create(ActionViewSchema, {
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: anyPack(
        MsgTimeoutOnCloseSchema,
        create(MsgTimeoutOnCloseSchema, {
          signer: 'cosmos000000000000000000000000000000000000000',
          proofHeight: {
            revisionNumber: 1n,
            revisionHeight: 30444680n,
          },
          packet: IbcPacket,
          nextSequenceRecv: 1000n,
          proofUnreceived: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          proofClose: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
        }),
      ),
    },
  },
});
