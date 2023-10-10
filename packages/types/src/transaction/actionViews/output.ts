import { z } from 'zod';
import { Base64StringSchema, base64ToUint8Array, InnerBase64Schema } from '../../base64';
import { NotePayloadSchema } from '../note-payload';
import { SpendNoteSchema, spendNoteToProto } from './spend';
import { ActionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  OutputView,
  OutputView_Opaque,
  OutputView_Visible,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { outputToProto } from '../output';

const OutputBodySchema = z.object({
  balanceCommitment: InnerBase64Schema,
  notePayload: NotePayloadSchema,
  ovkWrappedKey: Base64StringSchema,
  wrappedMemoKey: Base64StringSchema,
});

const OutputSchema = z.object({
  body: OutputBodySchema,
  proof: InnerBase64Schema,
});

const OpaqueOutputViewSchema = z.object({
  visible: z.object({
    note: SpendNoteSchema,
    payloadKey: InnerBase64Schema,
    output: OutputSchema,
  }),
});

const opaqueViewToProto = (v: z.infer<typeof OpaqueOutputViewSchema>): ActionView => {
  return new ActionView({
    actionView: {
      case: 'output',
      value: new OutputView({
        outputView: {
          case: 'opaque',
          value: new OutputView_Opaque({
            output: outputToProto(v.visible.output),
          }),
        },
      }),
    },
  });
};

const VisibleOutputViewSchema = z.object({
  visible: z.object({
    note: SpendNoteSchema,
    payloadKey: InnerBase64Schema,
    output: z.object({
      body: OutputBodySchema,
      proof: InnerBase64Schema,
    }),
  }),
});

const visibleViewToProto = (v: z.infer<typeof VisibleOutputViewSchema>): ActionView => {
  return new ActionView({
    actionView: {
      case: 'output',
      value: new OutputView({
        outputView: {
          case: 'visible',
          value: new OutputView_Visible({
            output: outputToProto(v.visible.output),
            note: spendNoteToProto(v.visible.note),
            payloadKey: { inner: base64ToUint8Array(v.visible.payloadKey.inner) },
          }),
        },
      }),
    },
  });
};

export const OutputViewSchema = VisibleOutputViewSchema.or(OpaqueOutputViewSchema);

export const outputViewToProto = (ov: z.infer<typeof OutputViewSchema>): ActionView => {
  if ('visible' in ov) {
    return visibleViewToProto(ov);
  } else if ('opaque' in ov) {
    return opaqueViewToProto(ov);
  } else {
    console.error('Requires a type conversion for ActionView');
    return new ActionView({});
  }
};
