import { useQuery } from '@tanstack/react-query';
import {
  Position,
  PositionId,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const useComputePositionId = () => {
  return useQuery({
    queryKey: [],
    queryFn: async (): Promise<(position: Position) => PositionId> => {
      const { computePositionId } = await import('@penumbra-zone/wasm/dex');
      return computePositionId;
    },
  });
};
