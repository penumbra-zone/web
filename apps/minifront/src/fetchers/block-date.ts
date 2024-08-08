import { SctService } from '@penumbra-zone/protobuf';
import { praxClient } from '../prax';

export const getBlockDate = async (
  height: bigint,
  signal?: AbortSignal,
): Promise<Date | undefined> => {
  const { timestamp } = await praxClient
    .service(SctService)
    .timestampByHeight({ height }, { signal });
  return timestamp?.toDate();
};
