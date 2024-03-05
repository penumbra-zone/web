import { createGetter } from './utils/create-getter';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { Swap } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { getCommitment } from './swap';

const getSwap = createGetter(
  (transaction?: Transaction) =>
    transaction?.body?.actions.find(action => action.action.case === 'swap')?.action.value as
      | Swap
      | undefined,
);

export const getSwapCommitmentFromTx = getSwap.pipe(getCommitment);
