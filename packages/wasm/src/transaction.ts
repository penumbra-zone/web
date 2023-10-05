import { uint8ArrayToBase64, validateSchema } from 'penumbra-types';
import { decode_tx, transaction_info } from '@penumbra-zone/wasm-bundler';
import {
  DecodedTransaction,
  DecodedTransactionSchema,
  TxBytes,
} from 'penumbra-types/src/transaction/decoded';
import { TransactionInfo, TransactionInfoSchema } from 'penumbra-types/src/transaction/view';

export const decodeTx = (txBytes: TxBytes): DecodedTransaction => {
  const base64Bytes = uint8ArrayToBase64(txBytes);
  return validateSchema(DecodedTransactionSchema, decode_tx(base64Bytes));
};

export const transactionInfo = async (
  fullViewingKey: string,
  tx: DecodedTransaction,
): Promise<TransactionInfo> => {
  const result = (await transaction_info(fullViewingKey, tx)) as TransactionInfo;
  console.log('actual trans info', result);
  return validateSchema(TransactionInfoSchema, result);
};
