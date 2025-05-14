import { observer } from 'mobx-react-lite';
import { UnifiedAsset } from '@/pages/portfolio/api/use-unified-assets.ts';
import { pnum } from '@penumbra-zone/types/pnum';
import { ShieldButton, UnshieldButton } from '@/pages/portfolio/ui/shield-unshield.tsx';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { useState } from 'react';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { Button } from '@penumbra-zone/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const AssetRow = observer(
  ({
    asset,
    price,
    isCosmosConnected,
    isLastRow,
  }: {
    asset: UnifiedAsset;
    price?: { price: number; quoteSymbol: string };
    isCosmosConnected: boolean;
    isLastRow: boolean;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const variant = isLastRow ? 'lastCell' : 'lastCell';

    // Calculate values on demand
    const hasShieldedBalance = asset.shieldedBalances.length > 0;
    const hasPublicBalance = asset.publicBalances.length > 0;

    const totalShieldedBalance =
      hasShieldedBalance && price
        ? asset.shieldedBalances.reduce((sum, balance) => {
            const numericAmount = pnum(balance.valueView).toNumber();
            return sum + numericAmount;
          }, 0)
        : 0;

    // Calculate values using price data
    const shieldedValue = totalShieldedBalance * (price?.price ?? 0);

    const totalPublicBalance =
      hasPublicBalance && price
        ? asset.publicBalances.reduce((sum, balance) => {
            const numericAmount = pnum(balance.valueView).toNumber();
            return sum + numericAmount;
          }, 0)
        : 0;

    // Calculate values using price data
    const publicValue = totalPublicBalance * (price?.price ?? 0);

    const totalValue = shieldedValue + publicValue;

    // TODO: for total public and private valueViews, use a summed amount.

    const totalShieldedBalanceValueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: pnum(totalShieldedBalance, getDisplayDenomExponent(asset.metadata)).toAmount(),
          metadata: asset.metadata,
          equivalentValues: [],
        },
      },
    });

    const totalPublicBalanceValueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: pnum(totalPublicBalance, getDisplayDenomExponent(asset.metadata)).toAmount(),
          metadata: asset.metadata,
          equivalentValues: [],
        },
      },
    });

    return (
      <div
        className={`grid grid-cols-subgrid col-span-7 rounded-sm ${isExpanded ? 'bg-other-tonalFill5' : ''} `}
      >
        <div
          className={
            'col-span-7 grid grid-cols-subgrid border-b border-b-other-tonalStroke hover:bg-action-hoverOverlay hover:cursor-pointer'
          }
          onClick={() => setIsExpanded(prev => !prev)}
        >
          <TableCell variant={variant}>
            <div className='flex items-center'>
              {hasShieldedBalance ? (
                <ValueViewComponent
                  valueView={totalShieldedBalanceValueView}
                  trailingZeros={false}
                  priority={'tertiary'}
                  density={'compact'}
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
              <div className='flex items-center gap-3 justify-between w-full'>
                {hasPublicBalance ? (
                  <ValueViewComponent
                    valueView={totalPublicBalanceValueView}
                    trailingZeros={false}
                    priority={'tertiary'}
                    context={'table'}
                    density={'compact'}
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
            {shieldedValue > 0 && price ? (
              <Text variant={'smallTechnical'} color='text.secondary'>
                {shieldedValue.toFixed(2)} {price.quoteSymbol}
              </Text>
            ) : (
              <Text variant={'smallTechnical'} color='text.secondary'>
                -
              </Text>
            )}
          </TableCell>
          <TableCell variant={variant}>
            {publicValue > 0 && price ? (
              <Text variant={'smallTechnical'} color='text.secondary'>
                {publicValue.toFixed(2)} {price.quoteSymbol}
              </Text>
            ) : (
              <Text variant={'smallTechnical'} color='text.secondary'>
                -
              </Text>
            )}
          </TableCell>
          <TableCell variant={variant}>
            {totalValue > 0 && price ? (
              <Text variant={'smallTechnical'} color='text.secondary'>
                {totalValue.toFixed(2)} {price.quoteSymbol}
              </Text>
            ) : (
              <Text variant={'smallTechnical'} color='text.secondary'>
                -
              </Text>
            )}
          </TableCell>
          <TableCell variant={variant}>
            <Button iconOnly icon={isExpanded ? ChevronUp : ChevronDown}>
              &nbsp;
            </Button>
          </TableCell>
        </div>
        {isExpanded &&
          asset.shieldedBalances.map(bal => (
            <div
              key={bal.valueView.toJsonString()}
              className={'col-span-7 grid grid-cols-subgrid hover:bg-action-hoverOverlay'}
            >
              <TableCell variant={'lastCell'}>
                <div className='flex items-center gap-3 justify-between w-full'>
                  <div className={'py-3 ml-2'}>
                    <ValueViewComponent
                      valueView={bal.valueView}
                      trailingZeros={false}
                      priority={'tertiary'}
                      density={'slim'}
                      context={'table'}
                    />
                    <Text color={'text.secondary'} detail>
                      on Penumbra
                    </Text>
                  </div>
                  {getMetadata(bal.valueView).symbol.toLowerCase() !== 'um' && (
                    <UnshieldButton asset={bal} />
                  )}
                </div>
              </TableCell>
              <TableCell variant={'lastCell'}>
                <Text variant={'smallTechnical'} color='text.secondary'></Text>
              </TableCell>
              <TableCell variant={'lastCell'}>
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
              <TableCell variant={'lastCell'}>
                {shieldedValue > 0 && price ? (
                  <Text variant={'smallTechnical'} color='text.secondary'>
                    {shieldedValue.toFixed(2)} {price.quoteSymbol}
                  </Text>
                ) : (
                  <Text variant={'smallTechnical'} color='text.secondary'>
                    -
                  </Text>
                )}
              </TableCell>
              <TableCell variant={'lastCell'}>
                <Text variant={'smallTechnical'} color='text.secondary'></Text>
              </TableCell>
              <TableCell variant={'lastCell'}>
                <Text variant={'smallTechnical'} color='text.secondary'></Text>
              </TableCell>
            </div>
          ))}
        {isExpanded &&
          asset.publicBalances.map(bal => (
            <div
              key={bal.denom}
              className={`col-span-7 grid grid-cols-subgrid hover:bg-action-hoverOverlay`}
            >
              <TableCell variant={'lastCell'}>
                <div className='flex items-center'>
                  <Text variant={'smallTechnical'} color='text.secondary'></Text>
                </div>
              </TableCell>
              <TableCell variant={'lastCell'}>
                <div className='flex items-center gap-3 justify-between w-full space-x-5'>
                  <div className={'py-3'}>
                    <ValueViewComponent
                      valueView={bal.valueView}
                      trailingZeros={false}
                      priority='tertiary'
                      density='slim'
                      context='table'
                    />
                    <Text color='text.secondary' detail>
                      on {bal.chainId}
                    </Text>
                  </div>
                  <ShieldButton asset={asset} />
                </div>
              </TableCell>
              <TableCell variant={'lastCell'}>
                {price ? (
                  <div className='flex flex-col'>
                    <Text variant='smallTechnical' color='text.secondary'>
                      {price.price.toFixed(4)} {price.quoteSymbol}
                    </Text>
                  </div>
                ) : (
                  <Text variant='smallTechnical' color='text.secondary'></Text>
                )}
              </TableCell>
              <TableCell variant={'lastCell'}>
                <Text variant={'smallTechnical'} color='text.secondary'></Text>
              </TableCell>
              <TableCell variant={'lastCell'}>
                {publicValue > 0 && price ? (
                  <Text variant={'smallTechnical'} color='text.secondary'>
                    {publicValue.toFixed(2)} {price.quoteSymbol}
                  </Text>
                ) : (
                  <Text variant={'smallTechnical'} color='text.secondary'>
                    -
                  </Text>
                )}
              </TableCell>
              <TableCell variant={'lastCell'}>
                <Text variant={'smallTechnical'} color='text.secondary'></Text>
              </TableCell>
            </div>
          ))}
      </div>
    );
  },
);
