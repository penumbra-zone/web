import { DexService, ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

// 1) Query prax to get position ids
// 2) Take those position ids and get position info from the node
// Context on two-step fetching process: https://github.com/penumbra-zone/penumbra/pull/4837
const fetchQuery = async (): Promise<Map<PositionId, Position>> => {
  const ownedRes = await Array.fromAsync(penumbra.service(ViewService).ownedPositionIds({}));
  const positionIds = ownedRes.map(r => r.positionId).filter(Boolean) as PositionId[];

  const positionsRes = await Array.fromAsync(
    penumbra.service(DexService).liquidityPositionsById({ positionId: positionIds }),
  );
  if (positionsRes.length !== ownedRes.length) {
    throw new Error('owned id array does not match the length of the positions response');
  }
  const positions = positionsRes.map(r => r.data).filter(Boolean) as Position[];

  const positionsById = new Map<PositionId, Position>();
  positions.forEach((position, index) => {
    // The responses are in the same order as the requests. Hence, the index matching.
    const positionId = positionIds[index];
    if (positionId) {
      positionsById.set(positionId, position);
    }
  });

  return positionsById;
};

/**
 * Must be used within the `observer` mobX HOC
 */
export const usePositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: fetchQuery,
    retry: 1,
    enabled: connectionStore.connected,
  });
};

export const stateToString = (state?: PositionState_PositionStateEnum) => {
  switch (state) {
    case PositionState_PositionStateEnum.UNSPECIFIED: {
      return 'Unspecified';
    }
    case PositionState_PositionStateEnum.OPENED: {
      return 'Opened';
    }
    case PositionState_PositionStateEnum.CLOSED: {
      return 'Closed';
    }
    case PositionState_PositionStateEnum.WITHDRAWN: {
      return 'Withdrawn';
    }
    case PositionState_PositionStateEnum.CLAIMED: {
      return 'Claimed';
    }
    case undefined: {
      return 'Unspecified';
    }
  }
};
