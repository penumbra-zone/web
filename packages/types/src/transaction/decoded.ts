import { z } from 'zod';
import { Base64StringSchema, InnerBase64Schema } from '../base64';

export const txBytesSchema = z.instanceof(Uint8Array);

export type TxBytes = z.infer<typeof txBytesSchema>;

const SpendSchema = z.object({
  authSig: InnerBase64Schema,
  body: z.object({
    balanceCommitment: InnerBase64Schema,
    nullifier: Base64StringSchema,
    rk: Base64StringSchema,
  }),
  proof: InnerBase64Schema,
});

export const NotePayloadSchema = z.object({
  encryptedNote: InnerBase64Schema,
  ephemeralKey: Base64StringSchema,
  noteCommitment: InnerBase64Schema,
});

const OutputSchema = z.object({
  body: z.object({
    balanceCommitment: InnerBase64Schema,
    notePayload: NotePayloadSchema,
    ovkWrappedKey: Base64StringSchema,
    wrappedMemoKey: Base64StringSchema,
  }),
  proof: InnerBase64Schema,
});

const ActionSchema = z.union([
  z.object({ spend: SpendSchema }),
  z.object({ output: OutputSchema }),
]);

const BodySchema = z.object({
  actions: z.array(ActionSchema),
  detectionData: z.object({
    fmdClues: z.array(InnerBase64Schema),
  }),
  fee: z.object({
    amount: z.object({}),
  }),
  memoData: z.object({
    encryptedMemo: Base64StringSchema,
  }),
  transactionParameters: z.object({
    chainId: z.string(),
  }),
});

export const DecodedTransactionSchema = z.object({
  anchor: InnerBase64Schema,
  bindingSig: Base64StringSchema,
  body: BodySchema,
});

export type DecodedTransaction = z.infer<typeof DecodedTransactionSchema>;
