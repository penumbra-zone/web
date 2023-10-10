import { z } from 'zod';
import { Base64StringSchema, InnerBase64Schema } from '../../base64';

const SpendBodySchema = z.object({
  balanceCommitment: InnerBase64Schema,
  nullifier: Base64StringSchema,
  rk: Base64StringSchema,
});

const SpendSchema = z.object({
  authSig: InnerBase64Schema,
  proof: InnerBase64Schema,
  body: SpendBodySchema,
});

export const VisibleAddressSchema = z.object({
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

export const SpendViewSchema = z.object({
  spend: z.object({
    visible: z.object({
      note: SpendNoteSchema,
      spend: SpendSchema,
    }),
  }),
});
