import { z } from 'zod';
import { Base64StringSchema, InnerBase64Schema } from '../../base64';
import { NotePayloadSchema } from '../note-payload';
import { VisibleAddressSchema } from './spend';

const OpaqueAddressSchema = z.object({
  opaque: z.object({
    address: InnerBase64Schema,
  }),
});

const AddressVisibilitySchema = z.union([OpaqueAddressSchema, VisibleAddressSchema]);

const OutputNoteSchema = z.object({
  value: z.unknown(),
  rseed: z.string(),
  address: AddressVisibilitySchema,
});

const OutputBodySchema = z.object({
  balanceCommitment: InnerBase64Schema,
  notePayload: NotePayloadSchema,
  ovkWrappedKey: Base64StringSchema,
  wrappedMemoKey: Base64StringSchema,
});

export const OutputViewSchema = z.object({
  output: z.object({
    visible: z.object({
      note: OutputNoteSchema,
      payloadKey: InnerBase64Schema,
      output: z.object({
        body: OutputBodySchema,
        proof: InnerBase64Schema,
      }),
    }),
  }),
});
