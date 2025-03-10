import { DexService, ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { queryClient } from '@/shared/const/queryClient';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

// 1) Query prax to get position ids
// 2) Take those position ids and get position info from the node
// Context on two-step fetching process: https://github.com/penumbra-zone/penumbra/pull/4837
const fetchQuery = async (subaccount?: number): Promise<Map<string, Position>> => {
  const ownedRes = await Array.fromAsync(
    penumbra.service(ViewService).ownedPositionIds({
      // In the future, it might change to `subaccount === 0`, so that the main account will become default
      subaccount:
        typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount }),
    }),
  );
  const positionIds = ownedRes.map(r => r.positionId).filter(Boolean) as PositionId[];

  const positionsRes = await Array.fromAsync(
    penumbra.service(DexService).liquidityPositionsById({ positionId: positionIds }),
  );
  if (positionsRes.length !== ownedRes.length) {
    throw new Error('owned id array does not match the length of the positions response');
  }
  const positions = positionsRes.map(r => r.data).filter(Boolean) as Position[];

  const positionsById = new Map<string, Position>();
  positions.forEach((position, index) => {
    // The responses are in the same order as the requests. Hence, the index matching.
    const positionId = positionIds[index];
    if (positionId) {
      positionsById.set(bech32mPositionId(positionId), position);
    }
  });

  return positionsById;
};

/**
 * Must be used within the `observer` mobX HOC
 */
export const usePositions = (subaccount?: number) => {
  return useQuery({
    queryKey: ['positions', subaccount],
    queryFn: () => fetchQuery(subaccount),
    retry: 1,
    enabled: connectionStore.connected,
  });
};

export const updatePositionsQuery = async () => {
  await queryClient.refetchQueries({ queryKey: ['positions'], enabled: true });
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
