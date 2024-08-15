import { createGetter } from './utils/create-getter.js';
import { Transaction } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { Swap } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { getCommitment } from './swap.js';

const getSwap = createGetter(
  (transaction?: Transaction) =>
    transaction?.body?.actions.find(action => action.action.case === 'swap')?.action.value as
      | Swap
      | undefined,
);

export const getSwapCommitmentFromTx = getSwap.pipe(getCommitment);
