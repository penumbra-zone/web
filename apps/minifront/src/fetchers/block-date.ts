import { sctClient } from '../clients';

export const getBlockDate = async (
  height: bigint,
  signal?: AbortSignal,
): Promise<Date | undefined> => {
  const { timestamp } = await sctClient.timestampByHeight({ height }, { signal });
  return timestamp?.toDate();
};
