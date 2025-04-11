import orderBy from 'lodash/orderBy';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { connectionStore } from '@/shared/model/connection';
import { useSortableTableHeaders } from '../../sortable-table-header';
import { TableRow } from './table-row';
import cn from 'clsx';

const THRESHOLD = 0.05;

const valueView = new ValueView({
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

const TABLE_CLASSES = {
  table: {
    default: cn('grid-cols-[1fr_1fr_1fr_1fr]'),
    canVote: cn('grid-cols-[1fr_1fr_1fr_1fr_72px]'),
  },
  row: {
    default: cn('col-span-4'),
    canVote: cn('col-span-5'),
  },
};

export const CurrentVotingResults = observer(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { getTableHeader, sortBy } = useSortableTableHeaders();

  // TODO: `canVote` should be true when connected and has delUM for this epoch
  const { connected: canVote } = connectionStore;
  const tableKey = canVote ? 'canVote' : 'default';

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const totalPages = 100;
  const totalVotes = 10000;

  const data = [
    {
      symbol: 'USDC',
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
      votes: 2777,
      estimatedIncentive: valueView,
    },
    {
      symbol: 'OSMO',
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
      votes: 1337,
      estimatedIncentive: valueView,
    },
    {
      symbol: 'ATOM',
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
      votes: 1000,
      estimatedIncentive: valueView,
    },
    {
      symbol: 'USDC',
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
      votes: 7,
      estimatedIncentive: valueView,
    },
    {
      symbol: 'OSMO',
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
      votes: 3,
      estimatedIncentive: valueView,
    },
    {
      symbol: 'ATOM',
      imgUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
      votes: 10,
      estimatedIncentive: valueView,
    },
  ];

  const loadingArr = new Array(10).fill({ votes: 0 });
  const sortedData =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- tmp
    orderBy(
      data.map(item => ({
        ...item,
        gaugeValue: item.votes / totalVotes,
        estimatedIncentiveNumber: pnum(item.estimatedIncentive).toNumber(),
      })),
      sortBy.key || 'votes',
      sortBy.direction,
    ) ?? loadingArr;

  return (
    <Card>
      <div className='flex flex-col p-3 gap-4'>
        <Text xxl color='text.primary'>
          Current Voting Results
        </Text>
        <Density compact>
          <div className={cn('grid h-auto overflow-auto', TABLE_CLASSES.table[tableKey])}>
            <div className={cn('grid grid-cols-subgrid', TABLE_CLASSES.row[tableKey])}>
              {getTableHeader('symbol', 'Asset')}
              {getTableHeader('gaugeValue', 'Percentage of Votes')}
              {getTableHeader('votes', 'Votes Cast')}
              {getTableHeader('estimatedIncentiveNumber', 'Estimated Incentive')}
              {canVote && <TableCell heading>Vote</TableCell>}
            </div>

            {sortedData
              .filter(item => item.votes / totalVotes >= THRESHOLD)
              .map(item => (
                <TableRow key={item.symbol} item={item} loading={isLoading} canVote={canVote} />
              ))}
            {!isLoading && (
              <div className={cn(TABLE_CLASSES.row[tableKey])}>
                <TableCell>
                  <Text technical color='text.secondary'>
                    Below threshold ({'<'}
                    {THRESHOLD * 100}%)
                  </Text>
                </TableCell>
              </div>
            )}
            {sortedData
              .filter(item => item.votes / totalVotes < THRESHOLD)
              .map(item => (
                <TableRow key={item.symbol} item={item} loading={isLoading} canVote={canVote} />
              ))}
            {!isLoading && (
              <div className={cn('pt-5', TABLE_CLASSES.row[tableKey])}>
                <Pagination
                  totalItems={totalPages}
                  visibleItems={5}
                  value={page}
                  limit={limit}
                  onChange={setPage}
                  onLimitChange={setLimit}
                />
              </div>
            )}
          </div>
        </Density>
      </div>
    </Card>
  );
});
