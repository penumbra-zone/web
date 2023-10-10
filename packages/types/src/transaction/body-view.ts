import { z } from 'zod';
import { base64ToUint8Array, InnerBase64Schema } from '../base64';
import { ActionViewSchema } from './actionViews';
import {
  DetectionData,
  MemoView,
  MemoView_Opaque,
  MemoView_Visible,
  TransactionBodyView,
  TransactionParameters,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { Fee } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import { AmountSchema, amountToProto } from '../amount';
import { Clue } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/decaf377_fmd/v1alpha1/decaf377_fmd_pb';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

const VisibleMemoSchema = z.object({
  visible: z.object({
    ciphertext: InnerBase64Schema,
    plaintext: z.object({
      sender: InnerBase64Schema,
    }),
  }),
});

const visibleToProto = (vm: z.infer<typeof VisibleMemoSchema>): MemoView => {
  return new MemoView({
    memoView: {
      case: 'visible',
      value: new MemoView_Visible({
        ciphertext: { inner: base64ToUint8Array(vm.visible.ciphertext.inner) },
        plaintext: {
          sender: new Address({
            inner: base64ToUint8Array(vm.visible.plaintext.sender.inner),
          }),
        },
      }),
    },
  });
};

const OpaqueMemoSchema = z.object({
  opaque: z.object({
    ciphertext: InnerBase64Schema,
  }),
});

const opaqueToProto = (om: z.infer<typeof OpaqueMemoSchema>): MemoView => {
  return new MemoView({
    memoView: {
      case: 'opaque',
      value: new MemoView_Opaque({
        ciphertext: { inner: base64ToUint8Array(om.opaque.ciphertext.inner) },
      }),
    },
  });
};

const MemoViewSchema = VisibleMemoSchema.or(OpaqueMemoSchema);

const memoToProto = (mv: z.infer<typeof MemoViewSchema>): MemoView => {
  if ('visible' in mv) {
    return visibleToProto(mv);
  } else if ('opaque' in mv) {
    return opaqueToProto(mv);
  } else {
    return new MemoView({
      memoView: {
        case: undefined,
        value: undefined,
      },
    });
  }
};

export const BodyViewSchema = z.object({
  actionViews: z.array(ActionViewSchema),
  detectionData: z.object({
    fmdClues: z.array(InnerBase64Schema),
  }),
  fee: z.object({
    amount: AmountSchema,
    assetId: InnerBase64Schema,
  }),
  memoView: MemoViewSchema,
  transactionParameters: z.object({
    chainId: z.string(),
  }),
});

export const bodyViewToProto = (bv: z.infer<typeof BodyViewSchema>): TransactionBodyView => {
  return new TransactionBodyView({
    // actionViews: ActionView[];
    transactionParameters: new TransactionParameters({
      chainId: bv.transactionParameters.chainId,
    }),
    fee: new Fee({
      amount: amountToProto(bv.fee.amount),
      assetId: { inner: base64ToUint8Array(bv.fee.assetId.inner) },
    }),
    detectionData: new DetectionData({
      fmdClues: bv.detectionData.fmdClues.map(
        c => new Clue({ inner: base64ToUint8Array(c.inner) }),
      ),
    }),
    memoView: memoToProto(bv.memoView),
  });
};
