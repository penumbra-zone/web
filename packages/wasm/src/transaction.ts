import { transaction_info } from '../wasm';
import {
  Transaction,
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { IdbConstants } from '@penumbra-zone/types/src/indexed-db';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const generateTransactionInfo = async (
  fullViewingKey: FullViewingKey,
  tx: Transaction,
  idbConstants: IdbConstants,
) => {
  const { txp, txv } = (await transaction_info(
    fullViewingKey.toJson(),
    tx.toJson(),
    idbConstants,
  )) as {
    txp: unknown;
    txv: unknown;
  };
  return {
    txp: TransactionPerspective.fromJsonString(JSON.stringify(txp)),
    txv: TransactionView.fromJsonString(JSON.stringify(txv)),
  };
};
