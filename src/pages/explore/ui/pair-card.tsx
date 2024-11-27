import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Star, CandlestickChart } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Density } from '@penumbra-zone/ui/Density';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import SparklineChart from './sparkline-chart.svg';
import { ShortChart } from './short-chart';
import ChevronDown from './chevron-down.svg';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
export const PENUMBRA_METADATA = new Metadata({
  base: 'upenumbra',
  name: 'Penumbra',
  display: 'penumbra',
  symbol: 'UM',
  penumbraAssetId: new AssetId({ inner: u8(32) }),
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
});

export const OSMO_METADATA = new Metadata({
  symbol: 'OSMO',
  name: 'Osmosis',
  penumbraAssetId: new AssetId({ inner: u8(32) }),
  base: 'uosmo',
  display: 'osmo',
  denomUnits: [{ denom: 'uosmo' }, { denom: 'osmo', exponent: 6 }],
  images: [
    { svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/test-usd.svg ' },
  ],
});

const ShimmeringBars = () => {
  return (
    <>
      <div className='w-16 h-4 my-1 bg-shimmer rounded-xs' />
      <div className='w-10 h-4 bg-shimmer rounded-xs' />
    </>
  );
};

export interface PairCardProps {
  loading?: boolean;
}

export const PairCard = ({ loading }: PairCardProps) => {
  const change = Number(-5.35);

  return (
    <div className='grid grid-cols-subgrid col-span-6 p-3 rounded-sm cursor-pointer transition-colors hover:bg-action-hoverOverlay'>
      <div className='relative h-10 flex items-center gap-2 text-text-primary'>
        <Density compact>
          <Button icon={Star} iconOnly>
            Favorite
          </Button>
        </Density>

        <div className='z-10'>
          <AssetIcon metadata={PENUMBRA_METADATA} size='lg' />
        </div>
        <div className='-ml-4'>
          <AssetIcon metadata={OSMO_METADATA} size='lg' />
        </div>

        <Text body>UM/TestUSD</Text>
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        {loading ? (
          <ShimmeringBars />
        ) : (
          <>
            <Text color='text.primary'>0.23</Text>
            <Text detail color='text.secondary'>
              delUM
            </Text>
          </>
        )}
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        {loading ? (
          <ShimmeringBars />
        ) : (
          <>
            <Text color='text.primary'>2.34M</Text>
            <Text detail color='text.secondary'>
              USDC
            </Text>
          </>
        )}
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        {loading ? (
          <ShimmeringBars />
        ) : (
          <>
            <Text color='text.primary'>1.37K</Text>
            <Text detail color='text.secondary'>
              USDC
            </Text>
          </>
        )}
      </div>

      <div className='h-10 flex items-center justify-end gap-2'>
        {loading ? (
          <>
            <div className='w-10 h-4 bg-shimmer rounded-xs' />
            <SparklineChart className='w-14 h-8' />
          </>
        ) : (
          <>
            {change >= 0 ? (
              <div className='flex items-center text-success-light'>
                <ChevronDown className='size-3 rotate-180 inline-block' />
                <Text>{change}%</Text>
              </div>
            ) : (
              <div className='flex items-center text-destructive-light'>
                <ChevronDown className='size-3 inline-block ' />
                <Text>{Math.abs(change)}%</Text>
              </div>
            )}

            <ShortChart change={change} />
          </>
        )}
      </div>

      <div className='h-10 flex flex-col items-end justify-center'>
        <Density compact>
          <Button icon={CandlestickChart} iconOnly>
            Actions
          </Button>
        </Density>
      </div>
    </div>
  );
};
