'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { XCircle } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Density } from '@penumbra-zone/ui/Density';
import { AssetsTable } from './ui/assets-table';
import { WalletConnect } from './ui/wallet-connect';
import { useRegistry } from '@/shared/api/registry.tsx';
import { IbcChainProvider } from '@/features/cosmos/chain-provider.tsx';
import { PortfolioPositionTabs } from './ui/position-tabs';
import { AssetBars } from './ui/asset-bars';
import { useUnifiedAssets } from '@/pages/portfolio/api/use-unified-assets';
import { PenumbraWaves } from '@/pages/explore/ui/waves.tsx';
import { ShieldingTicker } from '@/widgets/shielding-ticker';

interface PortfolioPageProps {
  isMobile: boolean;
}

export const PortfolioPage = ({ isMobile }: PortfolioPageProps): React.ReactNode => {
  const { data } = useRegistry();
  if (isMobile) {
    return <MobilePortfolioPage />;
  }

  return (
    <IbcChainProvider registry={data}>
      <DesktopPortfolioPage />
    </IbcChainProvider>
  );
};

function MobilePortfolioPage() {
  return (
    <section className='absolute inset-0 flex h-screen flex-col items-center justify-between gap-3 border-t border-neutral-800 p-4'>
      <div className='flex w-full grow flex-col items-center justify-center gap-4 p-0'>
        <div className='relative'>
          <XCircle className='h-8 w-8 text-neutral-light' />
        </div>

        <Text color={'text.secondary'} align={'center'} small={true}>
          This page requires a connection to your wallet, please switch to a desktop device.
        </Text>

        <Density compact={true}>
          {/* Copy Link Button */}
          <Button
            onClick={() => {
              // We discard the promise using void,
              // because Button only expects void-returning functions.
              void (async () => {
                /* Write the current url to clipboard */
                const currentUrl = window.location.href;
                await navigator.clipboard.writeText(currentUrl);
              })();
            }}
          >
            Copy Link
          </Button>
        </Density>
      </div>

      <Button>
        <Text body>Go Back</Text>
      </Button>
    </section>
  );
}

const DesktopPortfolioPage = observer(() => {
  const { isPenumbraConnected, isCosmosConnected } = useUnifiedAssets();
  return (
    <div className='container mx-auto flex max-w-[1136px] flex-col gap-4 py-8'>
      <PenumbraWaves />

      <WalletConnect />

      {/* Asset Allocation Bars */}
      {(isPenumbraConnected || isCosmosConnected) && <AssetBars />}

      <AssetsTable />
      <PortfolioPositionTabs />
      <ShieldingTicker />
    </div>
  );
});
