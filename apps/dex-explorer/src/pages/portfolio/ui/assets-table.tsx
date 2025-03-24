import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';

import { Density } from '@penumbra-zone/ui/Density';
import { Skeleton } from '@/shared/ui/skeleton';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';

import { observer } from 'mobx-react-lite';
import { useUnifiedAssets } from '../api/use-unified-assets.ts';
import { useAssetPrices } from '../api/use-asset-prices.ts';
import { CosmosConnectButton } from '@/features/cosmos/cosmos-connect-button.tsx';

const LoadingState = () => {
  return (
    <Card>
      <div className='p-3'>
        <Text as={'h4'} large color='text.primary'>
          Assets
        </Text>

        <Density compact>
          <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] overflow-y-auto overflow-x-auto'>
            <TableCell heading>Shielded Balance</TableCell>
            <TableCell heading>Public Balance</TableCell>
            <TableCell heading>Price</TableCell>
            <TableCell heading>Shielded Value</TableCell>
            <TableCell heading>Public Value</TableCell>
            <TableCell heading>Total Value</TableCell>

            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='grid grid-cols-subgrid col-span-6'>
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
                <TableCell loading>
                  <div className='w-24 h-5'>
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
        <div className='flex flex-col items-center justify-center h-[400px] gap-4'>
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
        <div className='flex flex-col items-center justify-center h-[400px] gap-4'>
          <Text color='text.secondary' small>
            No assets found in your connected wallets
          </Text>
        </div>
      </Card>
    </div>
  );
};

const AssetRow = observer(
  ({
    asset,
    price,
    isCosmosConnected,
    isLastRow,
  }: {
    asset: ReturnType<typeof useUnifiedAssets>['unifiedAssets'][0];
    price?: { price: number; quoteSymbol: string };
    isCosmosConnected: boolean;
    isLastRow: boolean;
  }) => {
    const variant = isLastRow ? 'lastCell' : 'cell';

    return (
      <div className='grid grid-cols-subgrid col-span-6'>
        <TableCell variant={variant}>
          <div className='flex items-center'>
            {asset.shieldedBalance ? (
              <ValueViewComponent
                valueView={asset.shieldedBalance.valueView}
                trailingZeros={false}
                priority={'primary'}
                context={'table'}
              />
            ) : (
              <Text variant={'smallTechnical'} color='text.secondary'>
                -
              </Text>
            )}
          </div>
        </TableCell>
        <TableCell variant={variant}>
          {isCosmosConnected ? (
            <div className='flex items-center'>
              {asset.publicBalance ? (
                <ValueViewComponent
                  valueView={asset.publicBalance.valueView}
                  trailingZeros={false}
                  priority={'primary'}
                  context={'table'}
                />
              ) : (
                <Text variant={'smallTechnical'} color='text.secondary'>
                  -
                </Text>
              )}
            </div>
          ) : (
            <Text variant={'smallTechnical'} color='text.secondary'>
              Cosmos wallet not connected
            </Text>
          )}
        </TableCell>
        <TableCell variant={variant}>
          {price ? (
            <div className='flex flex-col'>
              <Text variant={'smallTechnical'} color='text.secondary'>
                {price.price.toFixed(4)} {price.quoteSymbol}
              </Text>
            </div>
          ) : (
            <Text variant={'smallTechnical'} color='text.secondary'>
              -
            </Text>
          )}
        </TableCell>
        <TableCell variant={variant}>
          {asset.shieldedValue > 0 ? (
            <Text variant={'smallTechnical'} color='text.secondary'>
              {asset.shieldedValue.toFixed(2)} USDC
            </Text>
          ) : (
            <Text variant={'smallTechnical'} color='text.secondary'>
              -
            </Text>
          )}
        </TableCell>
        <TableCell variant={variant}>
          {asset.publicValue > 0 ? (
            <Text variant={'smallTechnical'} color='text.secondary'>
              {asset.publicValue.toFixed(2)} USDC
            </Text>
          ) : (
            <Text variant={'smallTechnical'} color='text.secondary'>
              -
            </Text>
          )}
        </TableCell>
        <TableCell variant={variant}>
          {asset.totalValue > 0 ? (
            <Text variant={'smallTechnical'} color='text.secondary'>
              {asset.totalValue.toFixed(2)} USDC
            </Text>
          ) : (
            <Text variant={'smallTechnical'} color='text.secondary'>
              -
            </Text>
          )}
        </TableCell>
      </div>
    );
  },
);

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
    <Card>
      <div className='p-3'>
        <div className={'flex justify-between mb-4'}>
          <Text as={'h4'} xxl color='text.primary'>
            Assets
          </Text>
          <CosmosConnectButton variant={'minimal'} actionType={'unshield'} />
        </div>

        <Density compact>
          <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] overflow-y-auto overflow-x-auto'>
            <TableCell heading>Shielded Balance</TableCell>
            <TableCell heading>Public Balance</TableCell>
            <TableCell heading>Price</TableCell>
            <TableCell heading>Shielded Value</TableCell>
            <TableCell heading>Public Value</TableCell>
            <TableCell heading>Total Value</TableCell>

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
      </div>
    </Card>
  );
});
