import { Card } from '@repo/ui/components/ui/card';
import { GradientHeader } from '@repo/ui/components/ui/gradient-header';
import { groupByAccount, useBalancesResponses } from '../../state/shared.ts';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types.ts';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { isKnown } from '../../state/helpers.ts';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { assetPatterns } from '@penumbra-zone/types/assets';
import {
  getAddressIndex,
  getDisplayFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';

export const shouldDisplay = (balance: BalancesResponse) =>
  isKnown(balance) && assetPatterns.lpNft.matches(getDisplay(getMetadata(balance.balanceView)));

const LpTokenSelector = (state: AbridgedZQueryState<BalancesResponse[]>) =>
  state.data
    ?.filter(shouldDisplay)
    .reduce(groupByAccount, [])
    .flatMap(g => g.balances);

export const LpPositions = () => {
  const allLpPositions = useBalancesResponses({
    select: LpTokenSelector,
  });

  return !allLpPositions?.length ? (
    <div className='hidden xl:block'></div>
  ) : (
    <Card layout>
      <GradientHeader layout>Limit orders</GradientHeader>
      {allLpPositions.map((b, i) => {
        return (
          <div key={i} className='flex items-center gap-4 p-2'>
            #{getAddressIndex(b).account} - {getDisplayFromBalancesResponse(b)}
          </div>
        );
      })}
    </Card>
  );
};
