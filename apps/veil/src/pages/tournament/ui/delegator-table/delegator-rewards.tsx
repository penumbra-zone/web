import { Text } from '@penumbra-zone/ui/Text';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Density } from '@penumbra-zone/ui/Density';
import { observer } from 'mobx-react-lite';
import { ReactNode, useState } from 'react';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Button } from '@penumbra-zone/ui/Button';
import { ChevronRight } from 'lucide-react';
import { useSortableTableHeaders } from '../sortable-table-header';
import { SortKey, useSpecificDelegatorRewards } from '../../api/use-specific-delegator-rewards';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { useGetMetadata } from '@/shared/api/assets';
import { toValueView } from '@/shared/utils/value-view';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

const BASE_PAGE = 0;
const BASE_LIMIT = 10;

interface LayoutProps {
  getTableHeader: (key: SortKey, label: string) => ReactNode;
}

const TableLayout = observer(
  ({ getTableHeader, children }: React.PropsWithChildren<LayoutProps>) => {
    return (
      <div className='flex flex-col gap-4 mt-4'>
        <Density compact>
          <div className='grid grid-cols-[auto_1fr_1fr_32px]'>
            <div className='grid grid-cols-subgrid col-span-4'>
              {getTableHeader('epoch', 'Epoch')}
              <TableCell heading>Casted Vote</TableCell>
              {getTableHeader('reward', 'Reward')}
              <TableCell heading> </TableCell>
            </div>
            {children}
          </div>
        </Density>
      </div>
    );
  },
);

const Layout = ({ totalChild, tableChild }: { totalChild: ReactNode; tableChild: ReactNode }) => {
  return (
    <div className='flex flex-col gap-4 p-6 rounded-lg bg-other-tonalFill5 backdrop-blur-lg'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-1'>
          <Text xxl color='text.primary'>
            Total Rewards Earned
          </Text>
          <Text small color='text.secondary'>
            Cumulative voting rewards (in UM) from all epochs{' '}
          </Text>
        </div>
        {totalChild}
      </div>
      {tableChild}
    </div>
  );
};

export const DelegatorRewards = ({ address }: { address: Address }) => {
  const getMetadata = useGetMetadata();
  const [page, setPage] = useState(BASE_PAGE);
  const [limit, setLimit] = useState(BASE_LIMIT);
  const { getTableHeader, sortBy } = useSortableTableHeaders<SortKey>('epoch', 'desc');

  const onLimitChange = (l: number) => {
    setLimit(l);
    setPage(BASE_PAGE);
  };
  const { data, isPending, error } = useSpecificDelegatorRewards({
    address,
    page,
    limit,
    sortDirection: sortBy.direction,
    sortKey: sortBy.key !== '' ? sortBy.key : undefined,
  });
  if (error) {
    return (
      <Layout totalChild={null} tableChild={<div className='text-red-500'>{String(error)}</div>} />
    );
  }
  if (isPending) {
    const totalChild = (
      <div className='w-24 h-10'>
        <Skeleton />
      </div>
    );
    const tableChild = (
      <TableLayout getTableHeader={getTableHeader}>
        {new Array(BASE_LIMIT).fill({}).map((_, i) => {
          return (
            <div key={`loading-${i}`} className='grid grid-cols-subgrid col-span-4'>
              <TableCell cell loading={true}>
                undefined
              </TableCell>
              <TableCell cell loading={true}>
                undefined
              </TableCell>
              <TableCell cell loading={true}>
                undefined
              </TableCell>
              <TableCell cell loading={true}>
                <Density slim>
                  <Button iconOnly icon={ChevronRight} disabled={true}>
                    Go to voting reward information
                  </Button>
                </Density>
              </TableCell>
            </div>
          );
        })}
      </TableLayout>
    );
    return <Layout totalChild={totalChild} tableChild={tableChild} />;
  }

  const total = toValueView({ value: data.total, getMetadata });
  const totalChild = (
    <div className='flex items-center gap-4 [&_span]:font-mono [&_span]:text-3xl'>
      <Density sparse>
        <ValueViewComponent valueView={total} priority='tertiary' />
      </Density>
    </div>
  );
  const tableChild = (
    <>
      <TableLayout getTableHeader={getTableHeader}>
        {data.rewards.map(({ epoch, value, vote }) => {
          const rowKey = `epoch-${epoch}`;

          const metadata = getMetadata(vote.asset);
          const valueView = toValueView(
            metadata
              ? { metadata, amount: new Amount({}) }
              : { assetId: vote.asset, amount: new Amount({}) },
          );

          return (
            <div key={rowKey} className='grid grid-cols-subgrid col-span-4'>
              <TableCell cell>{`Epoch #${epoch}`}</TableCell>

              <TableCell cell>
                <span className='font-mono'>{`${(vote.share * 100).toFixed(3)}% for `}</span>
                <ValueViewComponent showValue={false} valueView={valueView} />
              </TableCell>

              <TableCell cell>
                <ValueViewComponent
                  valueView={toValueView({ value, getMetadata })}
                  priority='tertiary'
                />
              </TableCell>

              <TableCell cell>
                <Density slim>
                  <Button
                    iconOnly
                    icon={ChevronRight}
                    onClick={() => (window.location.href = `/tournament/${epoch}`)}
                  >
                    Go to voting reward information
                  </Button>
                </Density>
              </TableCell>
            </div>
          );
        })}
      </TableLayout>

      <Pagination
        totalItems={data.count}
        visibleItems={data.rewards.length}
        value={page + 1}
        limit={limit}
        onChange={x => setPage(x - 1)}
        onLimitChange={onLimitChange}
      />
    </>
  );

  return <Layout totalChild={totalChild} tableChild={tableChild} />;
};
