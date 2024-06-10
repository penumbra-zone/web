import { tendermintClient } from '../clients';

export const getBlockDate = async (
  height: bigint,
  signal?: AbortSignal,
): Promise<Date | undefined> => {
  const { block } = await tendermintClient.getBlockByHeight({ height }, { signal });
  return block?.header?.time?.toDate();
};
