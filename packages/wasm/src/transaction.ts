import { transaction_info } from '../wasm';
import {
  Transaction,
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { IdbConstants } from '@penumbra-zone/types/indexed-db';
import { JsonValue } from '@bufbuild/protobuf';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

interface TxInfoWasmResult {
  txp: JsonValue;
  txv: JsonValue;
}

export const generateTransactionInfo = async (
  fullViewingKey: FullViewingKey,
  tx: Transaction,
  idbConstants: IdbConstants,
) => {
  const { txp, txv } = (await transaction_info(
    fullViewingKey.toBinary(),
    tx.toBinary(),
    idbConstants,
  )) as TxInfoWasmResult;
  return {
    txp: TransactionPerspective.fromJson(txp),
    txv: TransactionView.fromJson(txv),
  };
};
