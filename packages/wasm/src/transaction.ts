import { uint8ArrayToBase64, validateSchema } from 'penumbra-types';
import { decode_tx } from '@penumbra-zone/wasm-bundler';
import {
  DecodedTransaction,
  DecodedTransactionSchema,
  TxBytes,
} from 'penumbra-types/src/transaction';

export const decodeTx = (txBytes: TxBytes): DecodedTransaction => {
  const base64Bytes = uint8ArrayToBase64(txBytes);
  return validateSchema(DecodedTransactionSchema, decode_tx(base64Bytes));
};
