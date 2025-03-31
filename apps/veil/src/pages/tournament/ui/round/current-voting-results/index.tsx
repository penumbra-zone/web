import { useEffect, useState } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Density } from '@penumbra-zone/ui/Density';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { Skeleton } from '@/shared/ui/skeleton';
import { ValueView, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { TableRow } from './table-row';

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

export const CurrentVotingResults = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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

  return (
    <Card>
      <div className='flex flex-col p-3 gap-4'>
        <Text xxl color='text.primary'>
          Current Voting Results
        </Text>
        <Density compact>
          <div className='grid grid-cols-5 h-auto overflow-auto'>
            <div className='grid grid-cols-subgrid col-span-5'>
              <TableCell heading>Asset</TableCell>
              <TableCell heading>Gauge Value</TableCell>
              <TableCell heading>Casted Votes</TableCell>
              <TableCell heading>Estimated Incentive</TableCell>
              <TableCell heading>Vote</TableCell>
            </div>

            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='grid grid-cols-subgrid col-span-5'>
                  <TableCell loading>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-full overflow-hidden'>
                        <Skeleton />
                      </div>
                      <div className='w-20 h-5'>
                        <Skeleton />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell loading>
                    <div className='w-24 h-5'>
                      <Skeleton />
                    </div>
                  </TableCell>
                  <TableCell loading>
                    <div className='w-24 h-5'>
                      <Skeleton />
                    </div>
                  </TableCell>
                  <TableCell loading>
                    <div className='w-24 h-5'>
                      <Skeleton />
                    </div>
                  </TableCell>
                  <TableCell loading>
                    <div className='w-24 h-5'>
                      <Skeleton />
                    </div>
                  </TableCell>
                </div>
              ))
            ) : (
              <>
                {data
                  .filter(item => item.votes / totalVotes >= THRESHOLD)
                  .sort((a, b) => b.votes - a.votes)
                  .map(item => (
                    <TableRow key={item.symbol} item={item} totalVotes={totalVotes} />
                  ))}
                <div className='col-span-5'>
                  <TableCell>
                    <Text technical color='text.secondary'>
                      Below threshold ({'<'}
                      {THRESHOLD * 100}%)
                    </Text>
                  </TableCell>
                </div>
                {data
                  .filter(item => item.votes / totalVotes < THRESHOLD)
                  .sort((a, b) => b.votes - a.votes)
                  .map(item => (
                    <TableRow key={item.symbol} item={item} totalVotes={totalVotes} />
                  ))}
                <div className='col-span-5 pt-5'>
                  <Pagination
                    totalItems={totalPages}
                    visibleItems={5}
                    value={page}
                    limit={limit}
                    onChange={setPage}
                    onLimitChange={setLimit}
                  />
                </div>
              </>
            )}
          </div>
        </Density>
      </div>
    </Card>
  );
};
