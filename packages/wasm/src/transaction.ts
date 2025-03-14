import { transaction_perspective_and_view, transaction_summary } from '../wasm/index.js';
import { fromBinary, toBinary } from '@bufbuild/protobuf';

import {
  Transaction,
  TransactionView,
  TransactionSchema,
  TransactionPerspectiveSchema,
  TransactionSummarySchema,
  TransactionViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

import type { IdbConstants } from '@penumbra-zone/types/indexed-db';
import {
  FullViewingKey,
  FullViewingKeySchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const generateTransactionInfo = async (
  fullViewingKey: FullViewingKey,
  tx: Transaction,
  idbConstants: IdbConstants,
) => {
  const { txp, txv } = await transaction_perspective_and_view(
    toBinary(FullViewingKeySchema, fullViewingKey),
    toBinary(TransactionSchema, tx),
    idbConstants,
  );

  return {
    txp: fromBinary(TransactionPerspectiveSchema, txp),
    txv: fromBinary(TransactionViewSchema, txv),
  };
};

export const generateTransactionSummary = async (txv: TransactionView) => {
  const tx_summary = await transaction_summary(toBinary(TransactionViewSchema, txv));

  return fromBinary(TransactionSummarySchema, tx_summary);
};
