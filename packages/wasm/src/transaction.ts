import { transaction_info } from '../wasm';
import {
  Transaction,
  TransactionPerspective,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { IdbConstants } from '@penumbra-zone/types/indexed-db';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
//import { typeRegistry } from '@penumbra-zone/protobuf';

export const generateTransactionInfo = async (
  fullViewingKey: FullViewingKey,
  tx: Transaction,
  idbConstants: IdbConstants,
) => {
  const txInfo: unknown = await transaction_info(
    fullViewingKey.toBinary(),
    tx.toBinary(),
    idbConstants,
  );

  if (!Array.isArray(txInfo) || !Array.isArray(txInfo[0]) || !Array.isArray(txInfo[1]))
    throw new Error('Invalid transaction info');

  const txpBin = new Uint8Array(txInfo[0] as number[]);
  const txvBin = new Uint8Array(txInfo[1] as number[]);

  return {
    txp: TransactionPerspective.fromBinary(txpBin),
    txv: TransactionView.fromBinary(txvBin),
  };
};
