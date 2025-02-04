import { transaction_perspective_and_view, transaction_summary } from '../wasm/index.js';
import {
  Transaction,
  TransactionPerspective,
  TransactionSummary,
  TransactionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import type { IdbConstants } from '@penumbra-zone/types/indexed-db';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const generateTransactionInfo = async (
  fullViewingKey: FullViewingKey,
  tx: Transaction,
  idbConstants: IdbConstants,
) => {
  const { txp, txv } = await transaction_perspective_and_view(
    fullViewingKey.toBinary(),
    tx.toBinary(),
    idbConstants,
  );

  return {
    txp: TransactionPerspective.fromBinary(txp),
    txv: TransactionView.fromBinary(txv),
  };
};

export const generateTransactionSummary = async (txv: TransactionView) => {
  const tx_summary = await transaction_summary(txv.toBinary());

  return TransactionSummary.fromBinary(tx_summary);
};
