import {
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { z } from 'zod';

export const TransactionInfoSchema = z.object({
  txp: z.unknown(),
  txv: z.unknown(),
});

export interface TransactionInfo {
  txp: TransactionPerspective;
  txv: TransactionView;
}
