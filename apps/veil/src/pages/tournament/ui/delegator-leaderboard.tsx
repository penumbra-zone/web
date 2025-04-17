import cn from 'clsx';
import Link from 'next/link';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { Address, AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { splitLoHi } from '@penumbra-zone/types/lo-hi';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { PagePath } from '@/shared/const/pages';
import type { DelegatorLeaderboardSortKey, DelegatorLeaderboardData } from '../server/delegator-leaderboard';
import {
  useDelegatorLeaderboard,
  BASE_PAGE,
  BASE_LIMIT,
} from '../api/use-delegator-leaderboard';
import { useSortableTableHeaders } from './sortable-table-header';

export const DelegatorLeaderboard = observer(() => {
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } =
    useSortableTableHeaders<DelegatorLeaderboardSortKey>('place', 'asc');

  const {
    query: { isLoading },
    data,
    total,
  } = useDelegatorLeaderboard(page, limit, sortBy.key, sortBy.direction);

  const loadingArr = new Array(5).fill({}) as DelegatorLeaderboardData[];
  const leaderboard = data ?? loadingArr;

  const getAddressString = (address: Address) => {
    return encodeURIComponent(uint8ArrayToBase64(address.inner));
  };

  const getAddressView = (address: Address) => {
    return new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address,
        },
      },
    });
  };

  const getTotalRewards = (amount: number) => {
    const RANDOM_DELUM_DENOM = 'delegation_penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar';
    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: splitLoHi(BigInt(amount)),
          metadata: {
            denomUnits: [
              {
                denom: RANDOM_DELUM_DENOM,
                exponent: 6,
              }
            ],
            display: RANDOM_DELUM_DENOM,
            symbol: 'delUM',
          },
        },
      },
    });
  };

  const isExternal = (address: Address): boolean => {
    return true;
    // return !getAddressIndex.optional(address);
  };

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
          <div className='grid grid-cols-subgrid col-span-6'>
            {getTableHeader('place', 'Place')}
            <TableCell heading>Delegator Address</TableCell>
            {getTableHeader('epochs_voted_in', 'Rounds Participated')}
            {getTableHeader('streak', 'Voting Streak')}
            {getTableHeader('total_rewards', 'Rewards Earned')}
            <TableCell heading> </TableCell>
          </div>

          {leaderboard.map((row, index) => (
            <Link
              href={
                isLoading
                  ? ''
                  : PagePath.TournamentRound.replace(':address', getAddressString(row.address))
              }
              key={index}
              className={cn(
                'grid grid-cols-subgrid col-span-6',
                'hover:bg-action-hoverOverlay transition-colors cursor-pointer',
                !isExternal(row.address) && 'bg-other-tonalFill5',
              )}
            >
              <TableCell cell loading={isLoading}>
                {row.place}
              </TableCell>
              <TableCell cell loading={isLoading}>
                {!isLoading && (
                  <>
                    <AddressViewComponent
                      truncate
                      copyable={false}
                      hideIcon={isExternal(row.address)}
                      addressView={getAddressView(row.address)}
                    />
                    <i className='flex items-center justify-center size-4 text-text-secondary'>
                      <ExternalLink className='size-3' />
                    </i>
                  </>
                )}
              </TableCell>
              <TableCell cell loading={isLoading}>
                {row.epochs_voted_in}
              </TableCell>
              <TableCell cell loading={isLoading}>
                {row.streak}
              </TableCell>
              <TableCell cell loading={isLoading}>
                {row.total_rewards && (
                  <ValueViewComponent valueView={getTotalRewards(row.total_rewards)} priority='tertiary' />
                )}
              </TableCell>
              <TableCell cell loading={isLoading}>
                <Density slim>
                  <Button iconOnly icon={ChevronRight}>
                    Go to delegator vote information
                  </Button>
                </Density>
              </TableCell>
            </Link>
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
