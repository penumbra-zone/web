'use client';

import { useQuery } from '@tanstack/react-query';
import type { LeaderboardPageInfo, LeaderboardSearchParams } from './utils';
// import { apiFetch } from '@/shared/utils/api-fetch';
import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DUMMY_UM_METADATA, DUMMY_USDC_METADATA } from '@/pages/tournament/api/dummy';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

const dummyValueView = new ValueView({
  valueView: {
    value: {
      amount: new Amount({ lo: 133700000n }),
      metadata: new Metadata({
        base: 'um',
        display: 'um',
        denomUnits: [
          {
            denom: 'um',
            exponent: 6,
          },
        ],
        symbol: 'um',
        penumbraAssetId: { inner: new Uint8Array([1]) },
        coingeckoId: 'um',
        images: [],
        name: 'um',
        description: 'um',
      }),
    },
    case: 'knownAssetId',
  },
});

export const useLeaderboard = (filters: Partial<LeaderboardSearchParams>) => {
  return useQuery<LeaderboardPageInfo>({
    queryKey: [
      'leaderboard',
      filters.startBlock,
      filters.endBlock,
      filters.quote,
      filters.limit,
      filters.offset,
    ],
    queryFn: async () => {
      // const resp = await apiFetch<LeaderboardPageInfo>('/api/position/leaderboard', {
      //   ...(filters.quote && { quote: filters.quote }),
      //   startBlock: filters.startBlock,
      //   endBlock: filters.endBlock,
      //   limit: filters.limit,
      //   offset: filters.offset,
      // } as unknown as Record<string, string>);

      // eslint-disable-next-line no-promise-executor-return -- tmp
      await new Promise(resolve => setTimeout(resolve, 1000));

      const dummyResp: LeaderboardPageInfo = {
        data: [
          {
            asset1: DUMMY_UM_METADATA,
            asset2: DUMMY_USDC_METADATA,
            positionId: '1',
            volume1: dummyValueView,
            volume2: dummyValueView,
            fees1: dummyValueView,
            fees2: dummyValueView,
            executions: 7,
            openingTime: Date.now() - 99999999,
            closingTime: Date.now(),
            state: PositionState_PositionStateEnum.OPENED,
            pnlPercentage: 7.25,
          },
          {
            asset1: DUMMY_UM_METADATA,
            asset2: DUMMY_USDC_METADATA,
            positionId: '1',
            volume1: dummyValueView,
            volume2: dummyValueView,
            fees1: dummyValueView,
            fees2: dummyValueView,
            executions: 7,
            openingTime: Date.now() - 99999999,
            closingTime: Date.now(),
            state: PositionState_PositionStateEnum.OPENED,
            pnlPercentage: 7.25,
          },
          {
            asset1: DUMMY_UM_METADATA,
            asset2: DUMMY_USDC_METADATA,
            positionId: '1',
            volume1: dummyValueView,
            volume2: dummyValueView,
            fees1: dummyValueView,
            fees2: dummyValueView,
            executions: 7,
            openingTime: Date.now() - 99999999,
            closingTime: Date.now(),
            state: PositionState_PositionStateEnum.OPENED,
            pnlPercentage: 7.25,
          },
          {
            asset1: DUMMY_UM_METADATA,
            asset2: DUMMY_USDC_METADATA,
            positionId: '1',
            volume1: dummyValueView,
            volume2: dummyValueView,
            fees1: dummyValueView,
            fees2: dummyValueView,
            executions: 7,
            openingTime: Date.now() - 99999999,
            closingTime: Date.now(),
            state: PositionState_PositionStateEnum.OPENED,
            pnlPercentage: 7.25,
          },
          {
            asset1: DUMMY_UM_METADATA,
            asset2: DUMMY_USDC_METADATA,
            positionId: '1',
            volume1: dummyValueView,
            volume2: dummyValueView,
            fees1: dummyValueView,
            fees2: dummyValueView,
            executions: 7,
            openingTime: Date.now() - 99999999,
            closingTime: Date.now(),
            state: PositionState_PositionStateEnum.OPENED,
            pnlPercentage: 7.25,
          },
        ],
        filters: {
          limit: filters.limit ?? 30,
          offset: filters.offset ?? 0,
          quote: filters.quote ?? '',
          startBlock: filters.startBlock ?? 0,
          endBlock: filters.endBlock ?? 0,
        },
        totalCount: 0,
      };

      return dummyResp;
    },
  });
};
