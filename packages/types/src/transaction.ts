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
