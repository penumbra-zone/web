import { observer } from 'mobx-react-lite';
import { UnifiedAsset } from '@/pages/portfolio/api/use-unified-assets.ts';
import { pnum } from '@penumbra-zone/types/pnum';
import { ShieldButton } from '@/pages/portfolio/ui/shield-unshield.tsx';
import { TableCell } from '@penumbra-zone/ui/TableCell';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

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
    const variant = isLastRow ? 'lastCell' : 'cell';

    // Calculate values on demand
    const hasShieldedBalance = asset.shieldedBalances.length > 0;
    const hasPublicBalance = asset.publicBalances.length > 0;

    // Calculate values using price data
    const shieldedValue =
      hasShieldedBalance && price
        ? asset.shieldedBalances.reduce((sum, balance) => {
            const numericAmount = pnum(balance.valueView).toNumber();
            return sum + numericAmount * price.price;
          }, 0)
        : 0;

    const publicValue =
      hasPublicBalance && price
        ? asset.publicBalances.reduce((sum, balance) => {
            const numericAmount = pnum(balance.valueView).toNumber();
            return sum + numericAmount * price.price;
          }, 0)
        : 0;

    const totalValue = shieldedValue + publicValue;

    // TODO: for total public and private valueViews, use a summed amount.

    const totalShieldedBalanceValueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: pnum(shieldedValue, getDisplayDenomExponent(asset.metadata)).toAmount(),
          metadata: asset.metadata,
          equivalentValues: [],
        },
      },
    });

    const totalPublicBalanceValueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: pnum(publicValue, getDisplayDenomExponent(asset.metadata)).toAmount(),
          metadata: asset.metadata,
          equivalentValues: [],
        },
      },
    });

    return (
      <div className='grid grid-cols-subgrid col-span-6'>
        <TableCell variant={variant}>
          <div className='flex items-center'>
            {hasShieldedBalance ? (
              <>
                <ValueViewComponent
                  valueView={totalShieldedBalanceValueView}
                  trailingZeros={false}
                  priority={'primary'}
                  context={'table'}
                />
                {/* <UnshieldButton asset={asset} />*/}
              </>
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
                <>
                  <ValueViewComponent
                    valueView={totalPublicBalanceValueView}
                    trailingZeros={false}
                    priority={'primary'}
                    context={'table'}
                  />
                  <ShieldButton asset={asset} />
                </>
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
          {shieldedValue > 0 ? (
            <Text variant={'smallTechnical'} color='text.secondary'>
              {shieldedValue.toFixed(2)} USDC
            </Text>
          ) : (
            <Text variant={'smallTechnical'} color='text.secondary'>
              -
            </Text>
          )}
        </TableCell>
        <TableCell variant={variant}>
          {publicValue > 0 ? (
            <Text variant={'smallTechnical'} color='text.secondary'>
              {publicValue.toFixed(2)} USDC
            </Text>
          ) : (
            <Text variant={'smallTechnical'} color='text.secondary'>
              -
            </Text>
          )}
        </TableCell>
        <TableCell variant={variant}>
          {totalValue > 0 ? (
            <Text variant={'smallTechnical'} color='text.secondary'>
              {totalValue.toFixed(2)} USDC
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
