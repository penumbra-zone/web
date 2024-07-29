import { transaction_perspective_and_view } from '../wasm/index.js';
import {
  Transaction,
  TransactionPerspective,
  TransactionView,
  FullViewingKey,
} from '@penumbra-zone/protobuf/types';
import type { IdbConstants } from '@penumbra-zone/types/indexed-db';

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
