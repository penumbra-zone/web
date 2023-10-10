import {
  DecodedTransaction,
  DecodedTransactionSchema,
  TransactionInfo,
  TransactionInfoSchema,
  TxBytes,
  uint8ArrayToBase64,
  validateSchema,
} from 'penumbra-types';
import { decode_tx, transaction_info } from '@penumbra-zone/wasm-bundler';

export const decodeTx = (txBytes: TxBytes): DecodedTransaction => {
  const base64Bytes = uint8ArrayToBase64(txBytes);
  return validateSchema(DecodedTransactionSchema, decode_tx(base64Bytes));
};

export const transactionInfo = async (
  fullViewingKey: string,
  tx: DecodedTransaction,
): Promise<TransactionInfo> => {
  const result = (await transaction_info(fullViewingKey, tx)) as TransactionInfo;
  return validateSchema(TransactionInfoSchema, result);
};
