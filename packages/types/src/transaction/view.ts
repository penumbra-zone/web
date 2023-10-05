import { z } from 'zod';
import { Base64StringSchema, InnerBase64Schema } from '../base64';
import { NoteSchema } from '../state-commitment-tree';

const VisibleSchema = z.object({
  accountGroupId: InnerBase64Schema,
  address: InnerBase64Schema,
  index: z.object({
    randomizer: z.string(),
  }),
});

const OpaqueSchema = z.object({
  address: InnerBase64Schema,
});

const PayloadKeySchema = z.object({
  commitment: InnerBase64Schema,
  payloadKey: InnerBase64Schema,
});

const SpendNullifierSchema = z.object({
  note: NoteSchema,
  nullifier: InnerBase64Schema,
});

const TxpSchema = z.object({
  addressViews: z.array(VisibleSchema.or(OpaqueSchema)),
  payloadKeys: z.array(PayloadKeySchema),
  spendNullifiers: z.array(SpendNullifierSchema),
  transactionId: z.object({
    hash: Base64StringSchema,
  }),
});

const BodySchema = z.object({
  balanceCommitment: InnerBase64Schema,
  nullifier: Base64StringSchema,
  rk: Base64StringSchema,
});

const SpendSchema = z.object({
  authSig: InnerBase64Schema,
  proof: InnerBase64Schema,
  body: BodySchema,
});

const SpendViewSchema = z.object({
  spend: z.object({
    visible: z.object({
      note: NoteSchema,
      spend: SpendSchema,
    }),
  }),
});

const OutputViewSchema = z.object({
  output: z.object({
    visible: z.object({
      note: NoteSchema,
      payloadKey: Base64StringSchema,
      output: z.object({
        body: BodySchema,
        proof: InnerBase64Schema,
      }),
    }),
  }),
});

const BodyViewSchema = z.object({
  actionViews: z.array(SpendViewSchema.or(OutputViewSchema)),
  detectionData: z.object({
    fmdClues: z.array(InnerBase64Schema),
  }),
  fee: z.object({
    amount: z.unknown(),
  }),
  memoView: z.object({
    visible: z.object({
      ciphertext: InnerBase64Schema,
      plaintext: z.object({
        sender: InnerBase64Schema,
      }),
    }),
  }),
  transactionParameters: z.object({
    chainId: z.string(),
  }),
});

const TxvSchema = z.object({
  anchor: InnerBase64Schema,
  bindingSig: Base64StringSchema,
  bodyView: BodyViewSchema,
});

export const TransactionInfoSchema = z.object({
  txp: TxpSchema,
  txv: TxvSchema,
});

export type TransactionInfo = z.infer<typeof TransactionInfoSchema>;
