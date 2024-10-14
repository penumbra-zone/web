import { SctService } from '@penumbra-zone/protobuf';
import { penumbra } from '../penumbra';

export const getBlockDate = async (
  height: bigint,
  signal?: AbortSignal,
): Promise<Date | undefined> => {
  const { timestamp } = await penumbra
    .service(SctService)
    .timestampByHeight({ height }, { signal });
  return timestamp?.toDate();
};
