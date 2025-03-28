import { InfoCard } from '@/pages/explore/ui/info-card';
import { Text } from '@penumbra-zone/ui/Text';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { BlockSummaryApiResponse } from '@/shared/api/server/block/types';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { pnum } from '@penumbra-zone/types/pnum';

export function BlockSummary({ blockSummary }: { blockSummary: BlockSummaryApiResponse }) {
  if ('error' in blockSummary) {
    return <div>Error: {blockSummary.error}</div>;
  }

  return (
    <div>
      <div className='grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-2 mb-8'>
        <InfoCard title='Total Transactions'>
          <Text large color='text.primary'>
            {blockSummary.numTxs}
          </Text>
        </InfoCard>
        <InfoCard title='Total Swaps'>
          <Text large color='text.primary'>
            {blockSummary.numSwaps}
          </Text>
        </InfoCard>
        <InfoCard title='Total Swap Claims'>
          <Text large color='text.primary'>
            {blockSummary.numSwapClaims}
          </Text>
        </InfoCard>
        <InfoCard title='Total Open LPs'>
          <Text large color='text.primary'>
            {blockSummary.numOpenLps}
          </Text>
        </InfoCard>
        <InfoCard title='Total Closed LPs'>
          <Text large color='text.primary'>
            {blockSummary.numClosedLps}
          </Text>
        </InfoCard>
        <InfoCard title='Total Withdrawn LPs'>
          <Text large color='text.primary'>
            {blockSummary.numWithdrawnLps}
          </Text>
        </InfoCard>
      </div>
      <div>
        <div className='mb-4'>
          <Text large color='text.primary'>
            Swaps
          </Text>
        </div>
        <div className='grid grid-cols-4'>
          <div className='grid grid-cols-subgrid col-span-4'>
            <TableCell heading>From</TableCell>
            <TableCell heading>To</TableCell>
            <TableCell heading>Price</TableCell>
            <TableCell heading>Number of Hops</TableCell>
          </div>
          {blockSummary.batchSwaps.length ? (
            blockSummary.batchSwaps.map(swap => (
              <div className='grid grid-cols-subgrid col-span-4' key={JSON.stringify(swap)}>
                <TableCell>
                  <ValueViewComponent
                    valueView={pnum(swap.startInput).toValueView(swap.startAsset)}
                    trailingZeros={false}
                  />
                </TableCell>
                <TableCell>
                  <ValueViewComponent
                    valueView={pnum(swap.endOutput).toValueView(swap.endAsset)}
                    trailingZeros={false}
                  />
                </TableCell>
                <TableCell>
                  <Text color='text.primary'>
                    {swap.endPrice} {swap.endAsset.symbol}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text color='text.primary'>{swap.numSwaps}</Text>
                </TableCell>
              </div>
            ))
          ) : (
            <div className='grid grid-cols-subgrid col-span-4'>
              <TableCell>--</TableCell>
              <TableCell>--</TableCell>
              <TableCell>--</TableCell>
              <TableCell>--</TableCell>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
