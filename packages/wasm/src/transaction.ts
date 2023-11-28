import {
  IdbConstants,
  uint8ArrayToBase64,
  validateSchema,
  WasmTransactionInfo,
  WasmTransactionInfoSchema,
} from '@penumbra-zone/types';
import { decode_tx, encode_tx, transaction_info } from '@penumbra-zone-test/wasm-bundler';
import {
  Transaction,
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { z } from 'zod';

export const decodeTx = (txBytes: Uint8Array): Transaction => {
  const base64Bytes = uint8ArrayToBase64(txBytes);
  return Transaction.fromJsonString(JSON.stringify(decode_tx(base64Bytes)));
};

export const encodeTx = (tx: Transaction): Uint8Array => {
  const result = validateSchema(z.array(z.number()), encode_tx(tx.toJson()));
  return new Uint8Array(result);
};

export const transactionInfo = async (
  fullViewingKey: string,
  tx: Transaction,
  idbConstants: IdbConstants,
): Promise<WasmTransactionInfo> => {
  const result = validateSchema(
    WasmTransactionInfoSchema,
    await transaction_info(fullViewingKey, tx.toJson(), idbConstants),
  );
  return {
    txp: TransactionPerspective.fromJsonString(JSON.stringify(result.txp)),
    txv: TransactionView.fromJsonString(JSON.stringify(result.txv)),
  };
};
