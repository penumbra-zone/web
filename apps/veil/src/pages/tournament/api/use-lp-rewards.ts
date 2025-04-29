import orderBy from 'lodash/orderBy';
import { useQuery } from '@tanstack/react-query';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { apiFetch } from '@/shared/utils/api-fetch';

import {
  LpRewardsRequest,
  LpRewardsApiResponse,
  LpRewardsSortKey,
  LpRewardsSortDirection,
} from '@/pages/tournament/server/lp-rewards';
import { penumbra } from '@/shared/const/penumbra';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { useEffect, useState } from 'react';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export interface Reward {
  epoch: number;
  positionId: PositionId;
  reward: ValueView;
  isWithdrawn: boolean;
  // Easily-sortable fields for the rewards table
  sort?: {
    positionId: string;
    epoch: number;
    reward: number;
  };
}

export const useLpRewards = (
  subaccount: number,
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: LpRewardsSortKey | '',
  sortDirection?: LpRewardsSortDirection,
) => {
  const [positionIds, setPositionIds] = useState<string[]>([]);

  useEffect(() => {
    void Array.fromAsync(
      penumbra.service(ViewService).ownedPositionIds({
        subaccount: new AddressIndex({ account: subaccount }),
      }),
    ).then(ownedRes => {
      const positionIds = ownedRes
        .map(r => r.positionId && bech32mPositionId(r.positionId))
        .filter(Boolean) as string[];
      setPositionIds(positionIds);
    });
  }, [subaccount]);

  console.log('TCL: positionIds', positionIds);

  const query = useQuery<Required<Reward>[]>({
    queryKey: ['my-lp-rewards', positionIds, page, limit, sortKey, sortDirection],
    queryFn: async () => {
      return apiFetch<LpRewardsApiResponse>('/api/tournament/lp-rewards', {
        positionIds,
        page,
        limit,
        sortKey,
        sortDirection,
      } satisfies Partial<LpRewardsRequest>);
    },
    enabled: positionIds?.length > 0,
  });

  return {
    query,
    total: 5,
  };
};
