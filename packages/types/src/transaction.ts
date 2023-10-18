import {
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { z } from 'zod';

export const WasmTransactionInfoSchema = z.object({
  txp: z.unknown(),
  txv: z.unknown(),
});

export interface WasmTransactionInfo {
  txp: TransactionPerspective;
  txv: TransactionView;
}

export const WasmTxPlanSchema = z.object({
  actions: z.array(z.unknown()),
  expiry_height: z.string(),
  chain_id: z.string(),
  fee: z.unknown().optional(),
  clue_plans: z.array(z.unknown()),
  memo_plan: z.unknown().optional(),
});
