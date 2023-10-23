import {
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { z } from 'zod';
import { Base64StringSchema } from './base64';

export const WasmTransactionInfoSchema = z.object({
  txp: z.unknown(),
  txv: z.unknown(),
});

export interface WasmTransactionInfo {
  txp: TransactionPerspective;
  txv: TransactionView;
}

export const WasmAuthorizeSchema = z.object({
  effect_hash: Base64StringSchema,
  spend_auths: z.array(z.unknown()),
  delegator_vote_auths: z.array(z.unknown()),
});
