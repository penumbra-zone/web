import { useQuery } from '@tanstack/react-query';
import {
  Position,
  PositionId,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { computePositionId } from '@/shared/utils/crypto';

export const useComputePositionId = () => {
  return useQuery({
    queryKey: [],
    queryFn: (): Promise<(position: Position) => Promise<PositionId>> => {
      return Promise.resolve(computePositionId);
    },
  });
};
