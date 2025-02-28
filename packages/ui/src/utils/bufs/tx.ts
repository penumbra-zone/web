import {
  TransactionSummary,
  TransactionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { Balance, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ADDRESS_VIEW_DECODED } from './address-view';
import { PENUMBRA_METADATA, USDC_METADATA } from './metadata';
import { AMOUNT_999 } from './amount';
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
