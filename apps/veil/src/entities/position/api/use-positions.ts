import { DexService, ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Position,
  PositionId,
  PositionState,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { queryClient } from '@/shared/const/queryClient';
import { limitAsync } from '@/shared/utils/limit-async';

const BASE_LIMIT = 20;
const BASE_PAGE = 0;

// 1) Query prax to get position ids
// 2) Take those position ids and get position info from the node
// Context on two-step fetching process: https://github.com/penumbra-zone/penumbra/pull/4837
const fetchQuery = async (
  subaccount = 0,
  page = BASE_PAGE,
  stateFilter?: PositionState_PositionStateEnum[],
): Promise<Map<string, Position>> => {
  const states = stateFilter?.map(state => new PositionState({ state })) ?? [undefined];

  const res = await Promise.all(
    states.map(state =>
      Array.fromAsync(
        limitAsync(
          penumbra.service(ViewService).ownedPositionIds({
            subaccount: new AddressIndex({ account: subaccount }),
            positionState: state,
          }),
          BASE_LIMIT,
          BASE_LIMIT * page,
        ),
      ),
    ),
  );

  const positionIds = res
    .flat()
    .map(item => item.positionId)
    .filter(Boolean) as PositionId[];

  const positionsRes = await Array.fromAsync(
    penumbra.service(DexService).liquidityPositionsById({ positionId: positionIds }),
  );

  if (positionsRes.length !== positionIds.length) {
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
  console.log('TCL: positionsById', positionsById);

  return positionsById;
};

/**
 * Must be used within the `observer` mobX HOC
 */
export const usePositions = (subaccount = 0, stateFilter?: PositionState_PositionStateEnum[]) => {
  return useInfiniteQuery<Map<string, Position>>({
    queryKey: ['positions', subaccount, stateFilter],
    initialPageParam: BASE_PAGE,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.size ? (lastPageParam as number) + 1 : undefined;
    },
    queryFn: ({ pageParam }) => fetchQuery(subaccount, pageParam as number, stateFilter),
    enabled: connectionStore.connected,
  });
};

export const updatePositionsQuery = async () => {
  await queryClient.refetchQueries({ queryKey: ['positions'] });
};
