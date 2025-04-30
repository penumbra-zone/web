import cn from 'clsx';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { splitLoHi } from '@penumbra-zone/types/lo-hi';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { PagePath } from '@/shared/const/pages';
import { connectionStore } from '@/shared/model/connection';
import type {
  DelegatorLeaderboardSortKey,
  DelegatorLeaderboardData,
} from '../server/delegator-leaderboard';
import { useDelegatorLeaderboard, BASE_PAGE, BASE_LIMIT } from '../api/use-delegator-leaderboard';
import { useSortableTableHeaders } from './sortable-table-header';
import { useIndexByAddress } from '../api/use-index-by-address';
import { useStakingTokenMetadata } from '@/shared/api/registry';

const LeaderboardRow = observer(
  ({ row, loading }: { row: DelegatorLeaderboardData; loading: boolean }) => {
    const { connected } = connectionStore;
    const { data: subaccountIndex, isLoading: indexLoading } = useIndexByAddress(row.address);
    const { data: stakingToken, isLoading: stakingLoading } = useStakingTokenMetadata();

    const addressLink = useMemo(() => {
      if (loading) {
        return '';
      }
      const encoded = encodeURIComponent(bech32mAddress(row.address));
      return PagePath.TournamentDelegator.replace(':address', encoded);
    }, [row.address, loading]);

    const addressView = useMemo(() => {
      return connected && subaccountIndex
        ? new AddressView({
            addressView: {
              case: 'decoded',
              value: {
                address: row.address,
                index: subaccountIndex,
              },
            },
          })
        : new AddressView({
            addressView: {
              case: 'opaque',
              value: {
                address: row.address,
              },
            },
          });
    }, [row.address, subaccountIndex, connected]);

    const totalRewards = useMemo(() => {
      if (loading || stakingLoading || !stakingToken) {
        return undefined;
      }

      return new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: splitLoHi(BigInt(row.total_rewards)),
            metadata: stakingToken,
          },
        },
      });
    }, [loading, stakingLoading, row.total_rewards, stakingToken]);

    return (
      <Link
        href={addressLink}
        className={cn(
          'grid grid-cols-subgrid col-span-6',
          'hover:bg-action-hoverOverlay transition-colors cursor-pointer',
          !!subaccountIndex && 'bg-other-tonalFill5',
        )}
      >
        <TableCell cell loading={loading}>
          {row.place}
        </TableCell>
        <TableCell cell loading={loading || indexLoading}>
          {!loading && !indexLoading && !stakingLoading && (
            <>
              <AddressViewComponent
                truncate
                copyable={false}
                hideIcon={!subaccountIndex}
                addressView={addressView}
              />
              <i className='flex items-center justify-center size-4 text-text-secondary'>
                <ExternalLink className='size-3' />
              </i>
            </>
          )}
        </TableCell>
        <TableCell cell loading={loading}>
          {row.epochs_voted_in}
        </TableCell>
        <TableCell cell loading={loading}>
          {row.streak}
        </TableCell>
        <TableCell cell loading={loading}>
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- required to ensure staking token is loaded before rendering */}
          {row.total_rewards && stakingToken && !stakingLoading && (
            <ValueViewComponent valueView={totalRewards} priority='tertiary' />
          )}
        </TableCell>
        <TableCell cell loading={loading}>
          <Density slim>
            <Button iconOnly icon={ChevronRight}>
              Go to delegator vote information
            </Button>
          </Density>
        </TableCell>
      </Link>
    );
  },
);

export const DelegatorLeaderboard = observer(() => {
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } = useSortableTableHeaders<DelegatorLeaderboardSortKey>(
    'place',
    'asc',
  );

  const {
    query: { isLoading },
    data,
    total,
  } = useDelegatorLeaderboard(page, limit, sortBy.key, sortBy.direction);

  const loadingArr = new Array(5).fill({}) as DelegatorLeaderboardData[];
  const leaderboard = data ?? loadingArr;

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(BASE_PAGE);
  };

  return (
    <section className='p-6 rounded-lg bg-other-tonalFill5 backdrop-blur-lg flex flex-col gap-4'>
      <Text xxl color='text.primary'>
        Delegators Leaderboard
      </Text>
      <Density compact>
        <div className='grid grid-cols-[auto_200px_1fr_1fr_1fr_48px]'>
          <div key='header' className='grid grid-cols-subgrid col-span-6'>
            {getTableHeader('place', 'Place')}
            <TableCell heading>Delegator Address</TableCell>
            {getTableHeader('epochs_voted_in', 'Rounds Participated')}
            {getTableHeader('streak', 'Voting Streak')}
            {getTableHeader('total_rewards', 'Rewards Earned')}
            <TableCell heading> </TableCell>
          </div>

          {leaderboard.map((row, index) => (
            <LeaderboardRow
              key={isLoading ? `loading-${index}` : row.place}
              row={row}
              loading={isLoading}
            />
          ))}
        </div>
      </Density>

      {!isLoading && total >= BASE_LIMIT && (
        <Pagination
          totalItems={total}
          visibleItems={leaderboard.length}
          value={page}
          limit={limit}
          onChange={setPage}
          onLimitChange={onLimitChange}
        />
      )}
    </section>
  );
});
