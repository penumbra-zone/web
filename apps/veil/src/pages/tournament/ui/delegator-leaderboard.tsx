import cn from 'clsx';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { getAddressIndex, getAddress } from '@penumbra-zone/getters/address-view';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import {
  useDelegatorLeaderboard,
  BASE_PAGE,
  BASE_LIMIT,
  DelegatorLeaderboardInfo,
} from '../api/use-delegator-leaderboard';
import { useSortableTableHeaders } from './sortable-table-header';
import Link from 'next/link';

export const DelegatorLeaderboard = observer(() => {
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } =
    useSortableTableHeaders<keyof Required<DelegatorLeaderboardInfo>['sort']>();

  const {
    query: { data, isLoading },
    total,
  } = useDelegatorLeaderboard(page, limit, sortBy.key, sortBy.direction);

  const loadingArr = new Array(5).fill({}) as DelegatorLeaderboardInfo[];
  const leaderboard = data ?? loadingArr;

  const getAddressString = (addressView: AddressView) => {
    const address = getAddress.optional(addressView);
    return address?.inner ? encodeURIComponent(uint8ArrayToBase64(address.inner)) : '';
  };

  const isExternal = (address: AddressView): boolean => {
    return !getAddressIndex.optional(address);
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
            {getTableHeader('rounds', 'Rounds Participated')}
            {getTableHeader('streak', 'Voting Streak')}
            {getTableHeader('reward', 'Rewards Earned')}
            <TableCell heading> </TableCell>
          </div>

          {leaderboard.map((row, index) => (
            <Link
              href={isLoading ? '' : `/tournament/delegator/${getAddressString(row.address)}`}
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
                  <AddressViewComponent
                    addressView={row.address}
                    truncate
                    hideIcon={isExternal(row.address)}
                  />
                )}
              </TableCell>
              <TableCell cell loading={isLoading}>
                {row.rounds}
              </TableCell>
              <TableCell cell loading={isLoading}>
                {row.streak}
              </TableCell>
              <TableCell cell loading={isLoading}>
                <ValueViewComponent valueView={row.reward} priority='tertiary' />
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
