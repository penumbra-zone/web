import { z } from 'zod';
import { Base64StringSchema, InnerBase64Schema } from '../base64';
import { BodySchema } from './body';

export const txBytesSchema = z.instanceof(Uint8Array);

export type TxBytes = z.infer<typeof txBytesSchema>;

export const DecodedTransactionSchema = z.object({
  anchor: InnerBase64Schema,
  bindingSig: Base64StringSchema,
  body: BodySchema,
});

export type DecodedTransaction = z.infer<typeof DecodedTransactionSchema>;
