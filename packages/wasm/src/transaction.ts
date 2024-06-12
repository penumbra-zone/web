import { transaction_perspective_and_view } from '../wasm';
import {
  Transaction,
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { IdbConstants } from './idb';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

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
