import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { Vote } from './vote';
import { connectionStore } from '@/shared/model/connection';
import { usePersonalRewards } from '../api/use-personal-rewards';

export const VotingRewards = observer(() => {
  const { subaccount } = connectionStore;

  const { data, isLoading } = usePersonalRewards(subaccount);

  return (
    <>
      <Density compact>
        <div className='grid grid-cols-[auto_1fr_1fr_32px]'>
          <div className='grid grid-cols-subgrid col-span-4'>
            <TableCell heading>Epoch</TableCell>
            <TableCell heading>Casted Vote</TableCell>
            <TableCell heading>Reward</TableCell>
            <TableCell heading> </TableCell>
          </div>

          {data?.votes.length
            ? data.votes.map((group, groupIndex) =>
                group.votes.map((vote, voteIndex) => (
                  <div
                    key={`${groupIndex}-${voteIndex}`}
                    className='grid grid-cols-subgrid col-span-4'
                  >
                    <TableCell cell loading={isLoading}>
                      Epoch #{group.epochIndex?.toString()}
                    </TableCell>

                    <TableCell cell loading={isLoading}>
                      {!isLoading && vote.incentivizedAsset && vote.votePower && (
                        <Vote asset={vote.incentivizedAsset} percent={vote.votePower} />
                      )}
                    </TableCell>

                    <TableCell cell loading={isLoading}>
                      {vote.reward && (
                        <ValueViewComponent valueView={vote.reward} priority='tertiary' />
                      )}
                    </TableCell>

                    <TableCell cell loading={isLoading}>
                      <Density slim>
                        <Button iconOnly icon={ChevronRight}>
                          Go to voting reward information
                        </Button>
                      </Density>
                    </TableCell>
                  </div>
                )),
              )
            : !isLoading && (
                <div className='col-span-4 text-sm text-muted-foreground py-4'>
                  No voting rewards found for this account.
                </div>
              )}
        </div>
      </Density>

      {/* {!isLoading && total! >= BASE_LIMIT && (
        <Pagination
          totalItems={total!}
          // visibleItems={rewards.length}
          value={page}
          limit={limit}
          onChange={setPage}
          onLimitChange={onLimitChange}
        />
      )} */}
    </>
  );
});
