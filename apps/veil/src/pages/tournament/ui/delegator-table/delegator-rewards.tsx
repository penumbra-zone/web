import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import { ChevronRight } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Pagination } from '@penumbra-zone/ui/Pagination';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { useGetMetadata } from '@/shared/api/assets';
import { toValueView } from '@/shared/utils/value-view';
import { LoadingRow } from '@/shared/ui/loading-row';
import { getValueViewLength } from '@/shared/utils/get-max-padstart';
import { SortKey, useSpecificDelegatorRewards } from '../../api/use-specific-delegator-rewards';
import { useSortableTableHeaders, GetTableHeader } from '../sortable-table-header';
import { DelegatorReward } from '../../model/rewards';

const BASE_PAGE = 0;
const BASE_LIMIT = 10;

interface DelegatorRewardsRow extends DelegatorReward {
  rewardView: ValueView;
  voteView: ValueView;
}

interface LayoutProps {
  getTableHeader: GetTableHeader<SortKey>;
}

const TableLayout = observer(
  ({ getTableHeader, children }: React.PropsWithChildren<LayoutProps>) => {
    return (
      <div className='flex flex-col gap-4 mt-4'>
        <Density compact>
          <div className='grid grid-cols-[auto_1fr_1fr_48px]'>
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
        {new Array(BASE_LIMIT).fill({}).map((_, i) => (
          <LoadingRow key={`loading-${i}`} cells={4} />
        ))}
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

  const { rows, padStart } = data.rewards.reduce<{ rows: DelegatorRewardsRow[]; padStart: number }>(
    (accum, row) => {
      const metadata = getMetadata(row.vote.asset);
      const voteView = toValueView(
        metadata
          ? { metadata, amount: new Amount({}) }
          : { assetId: row.vote.asset, amount: new Amount({}) },
      );
      const rewardView = toValueView({ value: row.value, getMetadata });

      accum.padStart = Math.max(accum.padStart, getValueViewLength(rewardView));
      accum.rows.push({
        ...row,
        voteView,
        rewardView,
      });

      return accum;
    },
    { rows: [], padStart: 0 },
  );

  const tableChild = (
    <>
      <TableLayout getTableHeader={getTableHeader}>
        {rows.map(row => (
          <Link
            key={`epoch-${row.epoch}`}
            className='grid grid-cols-subgrid col-span-4 hover:bg-action-hoverOverlay'
            href={`/tournament/${row.epoch}`}
          >
            <TableCell cell>{`Epoch #${row.epoch}`}</TableCell>

            <TableCell cell>
              <span className='font-mono'>{`${(row.vote.share * 100).toFixed(3)}% for `}</span>
              <ValueViewComponent showValue={false} valueView={row.voteView} trailingZeros />
            </TableCell>

            <TableCell cell>
              <ValueViewComponent
                valueView={row.rewardView}
                priority='tertiary'
                trailingZeros
                padStart={padStart}
              />
            </TableCell>

            <TableCell cell>
              <Density slim>
                <Button iconOnly icon={ChevronRight}>
                  Go to voting reward information
                </Button>
              </Density>
            </TableCell>
          </Link>
        ))}
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
