'use client';

import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Density } from '@penumbra-zone/ui/Density';
import { AssetsTable } from './ui/assets-table';
import { PortfolioPositionTabs } from './ui/position-tabs';

interface PortfolioPageProps {
  isMobile: boolean;
}

export function PortfolioPage({ isMobile }: PortfolioPageProps): React.ReactNode {
  return isMobile ? <MobilePortfolioPage /> : <DesktopPortfolioPage />;
}

function MobilePortfolioPage() {
  return (
    <section className='absolute inset-0 h-screen flex flex-col items-center justify-between p-4 gap-3 border-t border-neutral-800'>
      <div className='flex flex-col justify-center items-center p-0 gap-4 w-full flex-grow'>
        <div className='relative'>
          <XCircle className='text-neutral-light w-8 h-8' />
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

      {/* Go Back Button */}
      <Button>
        <Text body>Go Back</Text>
      </Button>
    </section>
  );
}

function DesktopPortfolioPage() {
  return (
    <div className='sm:container mx-auto py-8 flex flex-col gap-4'>
      <AssetsTable />
      <PortfolioPositionTabs />
    </div>
  );
}
