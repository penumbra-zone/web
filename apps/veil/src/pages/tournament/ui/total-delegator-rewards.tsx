import { observer } from 'mobx-react-lite';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { connectionStore } from '@/shared/model/connection';
import { usePersonalRewards } from '../api/use-personal-rewards';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Button } from '@penumbra-zone/ui/Button';
import { ChevronRight } from 'lucide-react';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';
import { pnum } from '@penumbra-zone/types/pnum';

export const VotingRewards = observer(() => {
  const { subaccount } = connectionStore;

  const { epoch } = useCurrentEpoch();
  // This represents a subsequent invocation of `usePersonalRewards` which will use useQuery's cache.
  const { data, isLoading } = usePersonalRewards(subaccount, epoch);
  const { data: stakingToken } = useStakingTokenMetadata();

  // TODO: “Cast Vote” still needs a pindexer query—calculate it by dividing the
  // user’s voting power (from `delegator_history`) by the epoch’s total voting
  // power (from `delegator_summary`).

  return (
    <Density compact>
      <div className='grid grid-cols-[auto_1fr_1fr_32px]'>
        <div className='grid grid-cols-subgrid col-span-4'>
          <TableCell heading>Epoch</TableCell>
          <TableCell heading>Casted Vote</TableCell>
          <TableCell heading>Reward</TableCell>
          <TableCell heading> </TableCell>
        </div>

        {data?.data.length
          ? data.data.map(({ epoch, reward }, index) => {
              const rewardView = new ValueView({
                valueView: {
                  case: 'knownAssetId',
                  value: {
                    amount: pnum(reward).toAmount(),
                    metadata: stakingToken,
                  },
                },
              });

              return (
                <div key={index} className='grid grid-cols-subgrid col-span-4'>
                  <TableCell cell loading={isLoading}>
                    Epoch #{epoch.toString()}
                  </TableCell>

                  <TableCell cell loading={isLoading}>
                    -
                  </TableCell>

                  <TableCell cell loading={isLoading}>
                    <ValueViewComponent valueView={rewardView} priority='tertiary' />
                  </TableCell>

                  <TableCell cell loading={isLoading}>
                    <Density slim>
                      <Button iconOnly icon={ChevronRight}>
                        Go to voting reward information
                      </Button>
                    </Density>
                  </TableCell>
                </div>
              );
            })
          : !isLoading && (
              <div className='col-span-4 text-sm text-muted-foreground py-4'>
                No voting rewards found for this account.
              </div>
            )}
      </div>
    </Density>
  );
});
