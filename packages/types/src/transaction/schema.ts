import { z } from 'zod';
import { Base64StringSchema, InnerBase64Schema } from '../base64';

const SctProofSchema = z.object({
  authPath: z.array(
    z.object({
      sibling1: Base64StringSchema,
      sibling2: Base64StringSchema,
      sibling3: Base64StringSchema,
    }),
  ),
  noteCommitment: InnerBase64Schema,
  position: z.string(),
});

export const WasmWitnessDataSchema = z.object({
  anchor: InnerBase64Schema,
  stateCommitmentProofs: z.array(SctProofSchema),
});
