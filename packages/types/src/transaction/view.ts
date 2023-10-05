import { z } from 'zod';
import { Base64Str, Base64StringSchema, InnerBase64Schema } from '../base64';
import { DecodedTransaction, NotePayloadSchema } from './decoded';
import { NoteValueSchema } from '../state-commitment-tree';

const VisibleSchema = z.object({
  visible: z.object({
    accountGroupId: InnerBase64Schema,
    address: InnerBase64Schema,
    index: z.object({
      randomizer: Base64StringSchema,
    }),
  }),
});

const OpaqueSchema = z.object({
  opaque: z.object({
    address: InnerBase64Schema,
  }),
});

const PayloadKeySchema = z.object({
  commitment: InnerBase64Schema,
  payloadKey: InnerBase64Schema,
});

const SpendBodySchema = z.object({
  balanceCommitment: InnerBase64Schema,
  nullifier: Base64StringSchema,
  rk: Base64StringSchema,
});

const OutputBodySchema = z.object({
  balanceCommitment: InnerBase64Schema,
  notePayload: NotePayloadSchema,
  ovkWrappedKey: Base64StringSchema,
  wrappedMemoKey: Base64StringSchema,
});

const SpendSchema = z.object({
  authSig: InnerBase64Schema,
  proof: InnerBase64Schema,
  body: SpendBodySchema,
});

const SpendNullifierNoteSchema = z.object({
  value: NoteValueSchema,
  rseed: z.string(),
  address: InnerBase64Schema,
});

const SpendNullifierSchema = z.object({
  note: SpendNullifierNoteSchema,
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

export type TransactionPerspective = z.infer<typeof TxpSchema>;

const VisibleAddressSchema = z.object({
  visible: z.object({
    accountGroupId: InnerBase64Schema,
    address: InnerBase64Schema,
    index: z.object({
      randomizer: Base64StringSchema,
    }),
  }),
});

const SpendNoteSchema = z.object({
  value: z.unknown(),
  rseed: z.string(),
  address: VisibleAddressSchema,
});

const SpendViewSchema = z.object({
  spend: z.object({
    visible: z.object({
      note: SpendNoteSchema,
      spend: SpendSchema,
    }),
  }),
});

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

const OutputViewSchema = z.object({
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

const ActionViewSchema = z.union([SpendViewSchema, OutputViewSchema]);

const BodyViewSchema = z.object({
  actionViews: z.array(ActionViewSchema),
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

export type TransactionView = z.infer<typeof TxvSchema>;

export const TransactionInfoSchema = z.object({
  txp: TxpSchema,
  txv: TxvSchema,
});

export type TransactionInfo = z.infer<typeof TransactionInfoSchema>;

export interface StoredTransaction {
  blockHeight: bigint;
  id: Base64Str;
  tx: DecodedTransaction;
  perspective: TransactionPerspective;
  view: TransactionView;
}
