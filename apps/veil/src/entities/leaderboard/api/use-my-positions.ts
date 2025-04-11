import { useQuery } from '@tanstack/react-query';
import type { MyExecutionsRequestBody } from '@/shared/api/server/my-executions';
import type { RecentExecution } from '@/shared/api/server/recent-executions';
import { connectionStore } from '@/shared/model/connection';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import { usePathToMetadata } from '@/pages/trade/model/use-path';
import { queryClient } from '@/shared/const/queryClient';
import { pnum } from '@penumbra-zone/types/pnum';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { LatestSwapsResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { penumbra } from '@/shared/const/penumbra';
import { ViewService } from '@penumbra-zone/protobuf';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

const MY_POSITIONS_KEY = 'my-positions';

/**
 * Must be used within the `observer` mobX HOC
 */
export const useMyPositions = (subaccount: number, startingHeight: number, endHeight: number) => {
  const myPositionsQuery = useQuery({
    queryKey: [MY_POSITIONS_KEY, subaccount, startingHeight, endHeight],
    staleTime: Infinity,
    queryFn: async (): Promise<LatestSwapsResponse[]> => {
      // Two requests to get swaps in both directions: buy and sell
      const accountFilter =
        typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount });

      const swaps = await Promise.all([
        Array.fromAsync(
          penumbra.service(ViewService).latestSwaps({
            afterHeight: BigInt(startingHeight),
            accountFilter,
          }),
        ),
        Array.fromAsync(
          penumbra.service(ViewService).latestSwaps({
            afterHeight: BigInt(startingHeight),
            accountFilter,
          }),
        ),
      ]);

      const resp2 = await Array.fromAsync(
        penumbra.service(ViewService).ownedPositionIds({
          subaccount: new AddressIndex({ account: subaccount }),
        }),
      );
      console.log('TCL: useMyPositions -> resp2', resp2);

      return swaps.flat().filter(swap => swap.blockHeight <= endHeight);
    },
    enabled: connectionStore.connected,
  });

  // /**
  //  * When a new swap is made, it firstly appears in `latestSwaps` in Prax (myTradesQuery),
  //  * and after several seconds it appears in pindexer. This function makes `myExecutionsQuery`
  //  * refetch each 5 seconds when the amount of swaps in `myTradesQuery` is different from `myExecutionsQuery`.
  //  */
  // const getRefetchInterval = () => {
  //   const data = queryClient.getQueryData<RecentExecution[]>([
  //     MY_POSITIONS_KEY,
  //     myPositionsQuery.data?.length ?? 0,
  //   ]);
  //   return myPositionsQuery.data?.length !== data?.length ? 5000 : 0;
  // };

  // // Pindexer query – will not run if `myTradesQuery` data didn't change
  // const myExecutionsQuery = useQuery({
  //   queryKey: [MY_POSITIONS_KEY, myPositionsQuery.data?.length ?? 0],
  //   enabled: typeof myPositionsQuery.data !== 'undefined',
  //   staleTime: Infinity,
  //   refetchInterval: getRefetchInterval,
  //   queryFn: async () => {
  //     if (!myTradesQuery.data?.length) {
  //       return [];
  //     }

  //     const mapped = myTradesQuery.data
  //       .map(swap => {
  //         return (
  //           swap.pair &&
  //           swap.input &&
  //           swap.output && {
  //             height: Number(swap.blockHeight),
  //             input: Number(pnum(swap.input.amount).toNumber()),
  //             output: Number(pnum(swap.output.amount).toNumber()),
  //             base: swap.pair.start?.toJson(),
  //             quote: swap.pair.end?.toJson(),
  //           }
  //         );
  //       })
  //       .filter(Boolean) as MyExecutionsRequestBody[];

  //     return apiPostFetch<RecentExecution[]>('/api/my-executions', mapped);
  //   },
  // });

  // useRefetchOnNewBlock(MY_TRADES_KEY, myTradesQuery);

  return {
    ...myPositionsQuery,
    isLoading: myPositionsQuery.isLoading,
  };
};
