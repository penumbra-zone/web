import { Table } from '@penumbra-zone/ui/Table';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { ArrowDownRight, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Density } from '@penumbra-zone/ui/Density';
import { useBalances } from '@/shared/api/balances';
import { useAssets } from '@/shared/api/assets';
import { observer } from 'mobx-react-lite';
import { Skeleton } from '@/shared/ui/skeleton';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { connectionStore } from '@/shared/model/connection';
import {
  getMetadataFromBalancesResponse,
  getBalanceView,
} from '@penumbra-zone/getters/balances-response';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { formatAmount } from '@penumbra-zone/types/amount';
import { useRouter } from 'next/navigation';
import { Button } from '@penumbra-zone/ui/Button';
import { useState, useEffect } from 'react';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { useQuery } from '@tanstack/react-query';
import { penumbra } from '@/shared/const/penumbra';

const useChainId = () => {
  return useQuery({
    queryKey: ['chainId'],
    queryFn: async () => {
      const { parameters } = await penumbra.service(ViewService).appParameters({});
      return parameters?.chainId;
    },
    enabled: connectionStore.connected,
  });
};

const LoadingState = () => {
  return (
    <Card>
      <div className='p-3'>
        <Text as={'h4'} large color='text.primary'>
          Assets
        </Text>

        {/* Asset distribution bar skeleton */}
        <div className='w-full h-2 my-5'>
          <Skeleton />
        </div>

        {/* Legend skeleton */}
        <div className='flex flex-wrap gap-4 mb-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='flex items-center gap-2'>
              <div className='w-2 h-2'>
                <Skeleton />
              </div>
              <div className='w-20 h-4'>
                <Skeleton />
              </div>
            </div>
          ))}
        </div>

        <Density compact>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Asset</Table.Th>
                <Table.Th>Balance</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Value</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <Table.Tr key={i}>
                  <Table.Td>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-full overflow-hidden'>
                        <Skeleton />
                      </div>
                      <div className='w-20 h-5'>
                        <Skeleton />
                      </div>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div className='w-24 h-5'>
                      <Skeleton />
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div className='w-24 h-5'>
                      <Skeleton />
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div className='w-24 h-5'>
                      <Skeleton />
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div className='flex gap-2'>
                      <div className='w-8 h-8 rounded-full overflow-hidden'>
                        <Skeleton />
                      </div>
                      <div className='w-8 h-8 rounded-full overflow-hidden'>
                        <Skeleton />
                      </div>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
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

interface AssetDistribution {
  percentage: number;
  color: string;
  hasError: boolean;
  isOther: boolean;
}

interface DistributionResult {
  distribution: AssetDistribution[];
  sortedBalances: BalancesResponse[];
}

interface ValueWithMetadata {
  value: number;
  balance: BalancesResponse;
  hasError: boolean;
}

/** Minimum percentage threshold for an asset to be shown individually. Assets below this are grouped into "Other". Unit: % */
const SMALL_ASSET_THRESHOLD = 2;

/** HSL color saturation for asset bars. Unit: % */
const COLOR_SATURATION = 95;

/** HSL color lightness for asset bars. Unit: % */
const COLOR_LIGHTNESS = 53;

/** Angle used in the golden ratio color distribution algorithm to ensure visually distinct colors. Unit: degrees */
const GOLDEN_RATIO_ANGLE = 137.5;

const calculateAssetDistribution = (balances: BalancesResponse[]): DistributionResult => {
  // First filter out NFTs and special assets
  const displayableBalances = balances.filter(balance => {
    const metadata = getMetadataFromBalancesResponse.optional(balance);
    // If we don't have a symbol, we can't display it
    if (!metadata?.symbol) {
      return false;
    }

    // Filter out LP NFTs, unbonding tokens, and auction tokens
    return (
      !metadata.symbol.startsWith('lpNft') &&
      !metadata.symbol.startsWith('unbond') &&
      !metadata.symbol.startsWith('auction')
    );
  });

  // Calculate values and handle errors
  const valuesWithMetadata: ValueWithMetadata[] = displayableBalances.map(balance => {
    const valueView = getBalanceView.optional(balance);
    const metadata = getMetadataFromBalancesResponse.optional(balance);
    const amount = valueView?.valueView.value?.amount;

    if (!amount || !metadata) {
      console.warn(
        'Missing amount or metadata for balance',
        metadata?.symbol ?? 'unknown symbol',
        'amount:',
        amount ? amount.toJsonString() : 'null',
      );
      return { value: 0, balance, hasError: true };
    }

    try {
      const formattedAmount = Number(
        formatAmount({
          amount,
          exponent: getDisplayDenomExponent(metadata),
        }),
      );

      if (Number.isNaN(formattedAmount)) {
        throw new Error('Failed to format amount');
      }

      return {
        value: formattedAmount,
        balance,
        hasError: false,
      };
    } catch (error) {
      console.warn(
        'Error formatting amount for',
        metadata.symbol,
        'amount:',
        amount.toJsonString(),
        'error:',
        error,
      );
      return { value: 0, balance, hasError: true };
    }
  });

  const totalValue = valuesWithMetadata.reduce((acc, { value }) => acc + value, 0);

  if (totalValue === 0) {
    return { distribution: [], sortedBalances: [] };
  }

  // Sort by value percentage in descending order and calculate distribution
  const sorted = valuesWithMetadata
    .map((item, index) => {
      const metadata = getMetadataFromBalancesResponse.optional(item.balance);
      const primaryColor = metadata?.images[0]?.theme?.primaryColorHex;
      return {
        ...item,
        percentage: (item.value / totalValue) * 100,
        color:
          primaryColor ??
          `hsl(${(index * GOLDEN_RATIO_ANGLE) % 360}, ${COLOR_SATURATION}%, ${COLOR_LIGHTNESS}%)`,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Split into main assets and small assets
  const mainAssets = sorted.filter(asset => asset.percentage >= SMALL_ASSET_THRESHOLD);
  const smallAssets = sorted.filter(asset => asset.percentage < SMALL_ASSET_THRESHOLD);

  const otherPercentage = smallAssets.reduce((acc, asset) => acc + asset.percentage, 0);

  const distribution: AssetDistribution[] = [
    ...mainAssets.map(({ percentage, color, hasError }) => ({
      percentage,
      color,
      hasError,
      isOther: false,
    })),
    ...(otherPercentage > 0
      ? [
          {
            percentage: otherPercentage,
            color: `hsl(0, 0%, ${COLOR_LIGHTNESS}%)`,
            hasError: false,
            isOther: true,
          },
        ]
      : []),
  ];

  return {
    distribution,
    sortedBalances: sorted.map(({ balance }) => balance),
  };
};

export const AssetsTable = observer(() => {
  const router = useRouter();
  const { connected } = connectionStore;
  const addressIndex = new AddressIndex({ account: connectionStore.subaccount });
  const { data: balances, isLoading: balancesLoading } = useBalances(addressIndex.account);
  const { data: assets, isLoading: assetsLoading } = useAssets();
  const { data: chainId } = useChainId();
  const [distribution, setDistribution] = useState<DistributionResult>();

  useEffect(() => {
    if (balances) {
      setDistribution(calculateAssetDistribution(balances));
    }
  }, [balances]);

  const isTestnet = chainId !== 'penumbra-1';
  const stableCoinSymbol = isTestnet ? 'UM' : 'USDC';

  const isLoading = balancesLoading || assetsLoading || !balances || !assets || !distribution;

  if (isLoading) {
    return <LoadingState />;
  }
  if (!connected) {
    return <NotConnectedNotice />;
  }

  return (
    <div className='m-4 sm:m-0'>
      <Card>
        <div className='sm:p-3 p-1'>
          <Text large color='text.primary'>
            Assets
          </Text>

          {/* Asset distribution bar */}
          <div className='flex w-full h-4 mt-4 mb-6 gap-[5px]'>
            {distribution.distribution.map((asset, index) => (
              <div
                key={index}
                style={{
                  width: `${asset.percentage}%`,
                  backgroundColor: asset.color,
                }}
                className='h-full rounded'
              />
            ))}
          </div>

          {/* Legend */}
          <div className='flex flex-wrap gap-4 mb-6'>
            {distribution.sortedBalances.map((balance, index) => {
              const metadata = getMetadataFromBalancesResponse.optional(balance);
              const dist = distribution.distribution[index];

              // Skip small assets in legend if they're grouped into Other
              if (
                !metadata ||
                !dist ||
                (dist.isOther && index !== distribution.distribution.length - 1)
              ) {
                return null;
              }

              return (
                <div key={metadata.symbol} className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full' style={{ backgroundColor: dist.color }} />
                  <Text small color='text.secondary'>
                    {dist.isOther ? 'Other' : metadata.symbol} {dist.percentage.toFixed(1)}%
                  </Text>
                </div>
              );
            })}
          </div>

          <Density compact>
            <div className='overflow-scroll sm:overflow-hidden sm:m-0 -mr-4'>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Asset</Table.Th>
                    <Table.Th>Balance</Table.Th>
                    {/* TODO: Price and value are currently stubbed to -, pending pricing api in pindexer. */}
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Value</Table.Th>
                    <Table.Th hAlign='right'>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {distribution.sortedBalances.map((balance, index) => {
                    const metadata = getMetadataFromBalancesResponse.optional(balance);
                    const valueView = getBalanceView.optional(balance);
                    if (!metadata || !valueView) {
                      return null;
                    }

                    const hasError = distribution.distribution[index]?.hasError;

                    return (
                      <Table.Tr key={metadata.symbol}>
                        <Table.Td>
                          <div className='flex items-center gap-2'>
                            <AssetIcon metadata={metadata} />
                            <Text>{metadata.symbol}</Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          {hasError ? (
                            <div className='flex items-center gap-1'>
                              <AlertCircle className='w-4 h-4 text-orange-500' />
                              <Text color='text.secondary'>Error formatting balance</Text>
                            </div>
                          ) : (
                            <ValueViewComponent valueView={valueView} />
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text color='text.secondary'>-</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text color='text.secondary'>-</Text>
                        </Table.Td>
                        <Table.Td hAlign='right'>
                          <div className='flex gap-2 justify-end'>
                            <Button
                              icon={ArrowDownRight}
                              iconOnly
                              onClick={() =>
                                router.push(`/trade/${stableCoinSymbol}/${metadata.symbol}`)
                              }
                            >
                              Sell
                            </Button>
                            <Button
                              icon={ArrowUpRight}
                              iconOnly
                              onClick={() =>
                                router.push(`/trade/${metadata.symbol}/${stableCoinSymbol}`)
                              }
                            >
                              Buy
                            </Button>
                          </div>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </div>
          </Density>
        </div>
      </Card>
    </div>
  );
});
