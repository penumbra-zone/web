import { TransactionSummary, TransactionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { Balance, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ADDRESS_VIEW_DECODED } from './address-view';
import { PENUMBRA_METADATA } from './metadata';
import { AMOUNT_999 } from './amount';
import { SwapAction } from './action-view';

export const TxSummary = new TransactionSummary({
  effects: [
    {
      address: ADDRESS_VIEW_DECODED,
      balance: new Balance({
        values: [
          {
            negated: false,
            value: new Value({
              amount: AMOUNT_999,
              assetId: PENUMBRA_METADATA.penumbraAssetId,
            }),
          }
        ],
      }),
    }
  ],
});

export const TxInfo = new TransactionInfo({
  view: new TransactionView({
    bodyView: {
      actionViews: [SwapAction],
    },
  }),
  summary: TxSummary,
});
