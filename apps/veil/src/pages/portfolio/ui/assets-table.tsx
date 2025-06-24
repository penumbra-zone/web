import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';

import { Density } from '@penumbra-zone/ui/Density';
import { Skeleton } from '@/shared/ui/skeleton';

import { observer } from 'mobx-react-lite';
import { useUnifiedAssets } from '../api/use-unified-assets.ts';
import { useAssetPrices } from '../api/use-asset-prices.ts';
import { AssetRow } from '@/pages/portfolio/ui/asset-row.tsx';
import { PortfolioCard } from '@/pages/portfolio/ui/portfolio-card.tsx';

const LoadingState = () => {
  return (
    <Card>
      <div className='p-3'>
        <Text as={'h4'} large color='text.primary'>
          Assets
        </Text>

        <Density compact>
          <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] overflow-x-auto overflow-y-auto'>
            <TableCell heading>Shielded Balance</TableCell>
            <TableCell heading>Public Balance</TableCell>
            <TableCell heading>Price</TableCell>
            <TableCell heading>Shielded Value</TableCell>
            <TableCell heading>Public Value</TableCell>
            <TableCell heading>Total Value</TableCell>

            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='col-span-6 grid grid-cols-subgrid'>
                <TableCell loading>
                  <div className='flex items-center gap-2'>
                    <div className='h-6 w-6 overflow-hidden rounded-full'>
                      <Skeleton />
                    </div>
                    <div className='h-5 w-20'>
                      <Skeleton />
                    </div>
                  </div>
                </TableCell>
                <TableCell loading>
                  <div className='h-5 w-24'>
                    <Skeleton />
                  </div>
                </TableCell>
                <TableCell loading>
                  <div className='h-5 w-24'>
                    <Skeleton />
                  </div>
                </TableCell>
                <TableCell loading>
                  <div className='h-5 w-24'>
                    <Skeleton />
                  </div>
                </TableCell>
                <TableCell loading>
                  <div className='h-5 w-24'>
                    <Skeleton />
                  </div>
                </TableCell>
                <TableCell loading>
                  <div className='h-5 w-24'>
                    <Skeleton />
                  </div>
                </TableCell>
              </div>
            ))}
          </div>
        </Density>
      </div>
    </Card>
  );
};

const NotConnectedNotice = () => {
  return (
    <div className='m-4 sm:m-0'>
      <Card>
        <div className='flex h-[400px] flex-col items-center justify-center gap-4'>
          <Text color='text.secondary' small>
            Connect wallet to see your assets
          </Text>
        </div>
      </Card>
    </div>
  );
};

const NoAssetsNotice = () => {
  return (
    <div className='m-4 sm:m-0'>
      <Card>
        <div className='flex h-[400px] flex-col items-center justify-center gap-4'>
          <Text color='text.secondary' small>
            No assets found in your connected wallets
          </Text>
        </div>
      </Card>
    </div>
  );
};

export const AssetsTable = observer(() => {
  const { unifiedAssets, isLoading, isPenumbraConnected, isCosmosConnected } = useUnifiedAssets();
  const { prices } = useAssetPrices(unifiedAssets.map(asset => asset.metadata));

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isPenumbraConnected && !isCosmosConnected) {
    return <NotConnectedNotice />;
  }

  if (unifiedAssets.length === 0) {
    return <NoAssetsNotice />;
  }

  return (
    <PortfolioCard
      title={
        <div className={'flex justify-between'}>
          <Text as={'h4'} xxl color='text.primary'>
            Assets
          </Text>
        </div>
      }
    >
      <Density compact>
        <div className='grid grid-cols-[1fr_1fr_1fr_1fr_auto_auto_auto] overflow-x-auto overflow-y-auto'>
          <TableCell heading>Shielded Balance</TableCell>
          <TableCell heading>Public Balance</TableCell>
          <TableCell heading>Price</TableCell>
          <TableCell heading>Shielded Value</TableCell>
          <TableCell heading>Public Value</TableCell>
          <TableCell heading>Total Value</TableCell>
          <TableCell heading>&nbsp;</TableCell>

          {unifiedAssets.map((asset, index) => (
            <AssetRow
              key={asset.symbol}
              asset={asset}
              price={{
                price: prices[asset.symbol]?.price ?? 0,
                quoteSymbol: prices[asset.symbol]?.quoteSymbol ?? '-',
              }}
              isCosmosConnected={isCosmosConnected}
              isLastRow={index === unifiedAssets.length - 1}
            />
          ))}
        </div>
      </Density>
    </PortfolioCard>
  );
});
