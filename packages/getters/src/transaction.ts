import { createGetter } from './utils/create-getter.js';
import { Transaction, Swap } from '@penumbra-zone/protobuf/types';
import { getCommitment } from './swap.js';

const getSwap = createGetter(
  (transaction?: Transaction) =>
    transaction?.body?.actions.find(action => action.action.case === 'swap')?.action.value as
      | Swap
      | undefined,
);

export const getSwapCommitmentFromTx = getSwap.pipe(getCommitment);
