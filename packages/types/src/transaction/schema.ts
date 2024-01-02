import { z } from 'zod';
import {
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { Base64StringSchema, InnerBase64Schema } from '../base64';

export const WasmTransactionInfoSchema = z.object({
  txp: z.unknown(),
  txv: z.unknown(),
});

export interface WasmTransactionInfo {
  txp: TransactionPerspective;
  txv: TransactionView;
}

export const WasmAuthorizeSchema = z.object({
  effectHash: InnerBase64Schema,
  spendAuths: z.array(InnerBase64Schema),
});

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

export const WasmBuildSchema = z.object({
  anchor: InnerBase64Schema,
  bindingSig: Base64StringSchema,
  body: z.object({
    actions: z.array(z.unknown()),
    detectionData: z.unknown(),
    fee: z.unknown(),
    memoData: z.unknown(),
    transactionParameters: z.unknown(),
  }),
});

export const WasmActionSchema = z.record(z.unknown());
