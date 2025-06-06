import { ActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import {
  NoteView,
  OutputView,
  SpendView,
} from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  PositionClose,
  PositionOpen,
  PositionRewardClaim,
  PositionWithdraw,
  SwapClaimView,
  SwapView,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Delegate } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { IdentityKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ADDRESS_VIEW_DECODED } from './address-view';
import {
  DELEGATION_TOKEN_VALUE,
  PENUMBRA_VALUE_VIEW,
  PENUMBRA_VALUE_VIEW_ZERO,
  USDC_VALUE_VIEW,
} from './value-view';
import { DELEGATION_TOKEN_METADATA, PENUMBRA_METADATA, USDC_METADATA } from './metadata';
import { AMOUNT_123_456_789, AMOUNT_999, AMOUNT_ZERO } from './amount';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { Fee } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { Any } from '@bufbuild/protobuf';
import { MsgUpdateClient } from '@penumbra-zone/protobuf/ibc/core/client/v1/tx_pb';
import {
  ActionLiquidityTournamentVote,
  ActionLiquidityTournamentVoteView,
} from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';
import {
  MsgAcknowledgement,
  MsgRecvPacket,
  MsgTimeout,
  MsgTimeoutOnClose,
} from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { Packet } from '@penumbra-zone/protobuf/ibc/core/channel/v1/channel_pb';
import { Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

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

export const SpendActionOpaque = new ActionView({
  actionView: {
    case: 'spend',
    value: new SpendView({
      spendView: {
        case: 'opaque',
        value: {},
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

export const OutputActionOpaque = new ActionView({
  actionView: {
    case: 'output',
    value: new OutputView({
      outputView: {
        case: 'opaque',
        value: {},
      },
    }),
  },
});

export const SwapAction = new ActionView({
  actionView: {
    case: 'swap',
    value: new SwapView({
      swapView: {
        case: 'visible',
        value: {
          claimTx: new TransactionId({
            inner: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          }),
          asset1Metadata: USDC_METADATA,
          asset2Metadata: PENUMBRA_METADATA,
          output1: new NoteView({
            address: ADDRESS_VIEW_DECODED,
            value: USDC_VALUE_VIEW,
          }),
          output2: new NoteView({
            address: ADDRESS_VIEW_DECODED,
            value: PENUMBRA_VALUE_VIEW_ZERO,
          }),
          swapPlaintext: {
            claimFee: new Fee({
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

export const SwapActionOpaque = new ActionView({
  actionView: {
    case: 'swap',
    value: new SwapView({
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

export const SwapClaimAction = new ActionView({
  actionView: {
    case: 'swapClaim',
    value: new SwapClaimView({
      swapClaimView: {
        case: 'visible',
        value: {
          output1: new NoteView({
            address: ADDRESS_VIEW_DECODED,
            value: USDC_VALUE_VIEW,
          }),
          output2: new NoteView({
            address: ADDRESS_VIEW_DECODED,
            value: PENUMBRA_VALUE_VIEW,
          }),
          swapTx: new TransactionId({
            inner: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          }),
          swapClaim: {
            body: {
              fee: new Fee({
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

export const SwapClaimActionOpaque = new ActionView({
  actionView: {
    case: 'swapClaim',
    value: new SwapClaimView({
      swapClaimView: {
        case: 'opaque',
        value: {
          swapClaim: {
            body: {
              fee: new Fee({
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

//
// Position-related actions
//

export const PositionOpenAction = new ActionView({
  actionView: {
    case: 'positionOpen',
    value: new PositionOpen({
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

export const PositionCloseAction = new ActionView({
  actionView: {
    case: 'positionClose',
    value: new PositionClose({
      positionId: {
        inner: new Uint8Array([
          0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5,
          6, 7,
        ]),
      },
    }),
  },
});

export const PositionWithdrawAction = new ActionView({
  actionView: {
    case: 'positionWithdraw',
    value: new PositionWithdraw({
      positionId: {
        inner: new Uint8Array([
          0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5,
          6, 7,
        ]),
      },
    }),
  },
});

export const PositionRewardClaimAction = new ActionView({
  actionView: {
    case: 'positionRewardClaim',
    value: new PositionRewardClaim({
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

export const IbcRelayMsgUpdateClientAction = new ActionView({
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: Any.pack(
        new MsgUpdateClient({
          clientId: '07-tendermint-4',
          signer: 'cosmos000000000000000000000000000000000000000',
        }),
      ),
    },
  },
});

const OsmoIbcPacket = new Packet({
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

const PenumbraIbcPacket = new Packet({
  sequence: 3810n,
  sourcePort: 'transfer',
  sourceChannel: 'channel-79703',
  destinationPort: 'transfer',
  destinationChannel: 'channel-4',
  timeoutTimestamp: 1738993800000000000n,
  // This data encodes FungibleTokenPacketData message
  data: base64ToUint8Array(
    'eyJhbW91bnQiOiI2NTA1MDAwMDAiLCJkZW5vbSI6InRyYW5zZmVyL2NoYW5uZWwtNzk3MDMvdXBlbnVtYnJhIiwicmVjZWl2ZXIiOiJwZW51bWJyYTFubmtsOThsNTgzdmsyZ3gwZHo2MnJlNTN5aHNrbHNwZGV3ZG53dXYya3pldDN5bndoOTR4ZnN2NWE2bjU2ejl1ZXFxbjRweHJmMjN2dWc0cjk5ZDN5eDAwZGhsZTZmamRtdHd5aHg2ZnVycjMwazRnaDVlbjVuMnQ1bDl3OXJ3NTZ6ZWgyZiIsInNlbmRlciI6Im9zbW8xejV0cDRhNTBxbjU5emp0OWM3ZGthMDgzNHo1bDNyc3lqcjJyNXIifQ==',
  ),
});

// An Ibc deposit of 0.5 OSMO
export const OsmoIbcRelayMsgRecvPacketAction = new ActionView({
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: Any.pack(
        new MsgRecvPacket({
          packet: OsmoIbcPacket,
        }),
      ),
    },
  },
});

export const PenumbraIbcRelayMsgRecvPacketAction = new ActionView({
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: Any.pack(
        new MsgRecvPacket({
          packet: PenumbraIbcPacket,
        }),
      ),
    },
  },
});

export const IbcRelayMsgAcknowledgementAction = new ActionView({
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: Any.pack(
        new MsgAcknowledgement({
          signer: 'cosmos000000000000000000000000000000000000000',
          proofHeight: {
            revisionNumber: 1n,
            revisionHeight: 30444680n,
          },
          proofAcked: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          acknowledgement: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          packet: OsmoIbcPacket,
        }),
      ),
    },
  },
});

export const IbcRelayMsgTimeoutAction = new ActionView({
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: Any.pack(
        new MsgTimeout({
          signer: 'cosmos000000000000000000000000000000000000000',
          proofHeight: {
            revisionNumber: 1n,
            revisionHeight: 30444680n,
          },
          packet: OsmoIbcPacket,
          nextSequenceRecv: 100n,
          proofUnreceived: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
        }),
      ),
    },
  },
});

export const IbcRelayMsgTimeoutOnCloseAction = new ActionView({
  actionView: {
    case: 'ibcRelayAction',
    value: {
      rawAction: Any.pack(
        new MsgTimeoutOnClose({
          signer: 'cosmos000000000000000000000000000000000000000',
          proofHeight: {
            revisionNumber: 1n,
            revisionHeight: 30444680n,
          },
          packet: OsmoIbcPacket,
          nextSequenceRecv: 1000n,
          proofUnreceived: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
          proofClose: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
        }),
      ),
    },
  },
});

export const Ics20WithdrawalAction = new ActionView({
  actionView: {
    case: 'ics20Withdrawal',
    value: {
      returnAddress: ADDRESS_VIEW_DECODED.addressView.value?.address,
      destinationChainAddress: 'osmo1dyrr4r42ql4em7d46srcmnn5ymxk9asvcv95sg',
      amount: AMOUNT_123_456_789,
      denom: new Denom({ denom: PENUMBRA_METADATA.base }),
      sourceChannel: 'channel-4',
    },
  },
});

//
// LQT actions
//

const LQT_VOTE = new ActionLiquidityTournamentVote({
  body: {
    startPosition: 100n,
    value: DELEGATION_TOKEN_VALUE,
    rewardsRecipient: ADDRESS_VIEW_DECODED.addressView.value?.address,
    incentivized: {
      denom: PENUMBRA_METADATA.base,
    },
  },
});
export const LiquidityTournamentVoteAction = new ActionView({
  actionView: {
    case: 'actionLiquidityTournamentVote',
    value: new ActionLiquidityTournamentVoteView({
      liquidityTournamentVote: {
        case: 'visible',
        value: {
          note: {
            address: ADDRESS_VIEW_DECODED,
            value: {
              valueView: {
                case: 'knownAssetId',
                value: {
                  amount: DELEGATION_TOKEN_VALUE.amount,
                  metadata: DELEGATION_TOKEN_METADATA,
                },
              },
            },
          },
          vote: LQT_VOTE,
        },
      },
    }),
  },
});

export const LiquidityTournamentVoteActionOpaque = new ActionView({
  actionView: {
    case: 'actionLiquidityTournamentVote',
    value: new ActionLiquidityTournamentVoteView({
      liquidityTournamentVote: {
        case: 'opaque',
        value: {
          vote: LQT_VOTE,
        },
      },
    }),
  },
});

//
// Staking actions
//

// Sample validator identity key for delegation action
const VALIDATOR_IDENTITY_KEY = new IdentityKey({
  ik: base64ToUint8Array('LjqUxK87+7N/gcS4ud8b8y5xyTlguvuE0Yhn783Z0wg='),
});

export const DelegateAction = new ActionView({
  actionView: {
    case: 'delegate',
    value: new Delegate({
      validatorIdentity: VALIDATOR_IDENTITY_KEY,
      epochIndex: 123n,
      unbondedAmount: new Amount({ hi: 0n, lo: 1_000_000n }), // 1 UM input
      delegationAmount: new Amount({ hi: 0n, lo: 975_147n }), // 0.975147 delUM output
    }),
  },
});
