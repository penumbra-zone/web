import { ActionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import {
  NoteView,
  OutputView,
  SpendView,
} from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  SwapClaimView,
  SwapView,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ADDRESS_VIEW_DECODED } from './address-view';
import { PENUMBRA_VALUE_VIEW, PENUMBRA_VALUE_VIEW_ZERO, USDC_VALUE_VIEW } from './value-view';
import { PENUMBRA_METADATA, USDC_METADATA } from './metadata';
import { AMOUNT_123_456_789, AMOUNT_999, AMOUNT_ZERO } from './amount';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { Fee } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';

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
            value: PENUMBRA_VALUE_VIEW_ZERO,
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
