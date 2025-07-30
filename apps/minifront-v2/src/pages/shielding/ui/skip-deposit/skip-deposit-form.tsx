import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { Widget } from '@skip-go/widget';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { useIsConnected, useConnectWallet } from '@/shared/hooks/use-connection';

// Skip widget configuration based on legacy minifront
const defaultRoute = {
  srcChainId: 'noble-1',
  srcAssetDenom: 'ausdy',
  destChainId: 'penumbra-1',
};

const filter = {
  destination: {
    'penumbra-1': undefined,
  },
};

// Theme adapted for minifront-v2 design system
const theme = {
  brandColor: '#ba4d14', // Primary main color from Penumbra design system
  primary: {
    background: {
      normal: '#0a0a0a', // Dark background
      transparent: 'rgba(10, 10, 10, 0.8)',
    },
    text: {
      normal: '#ffffff',
      lowContrast: '#cccccc',
      ultraLowContrast: '#888888',
    },
    ghostButtonHover: '#ba4d14', // Primary main color
  },
  secondary: {
    background: {
      normal: '#1a1a1a',
      transparent: 'rgba(26, 26, 26, 0.8)',
      hover: '#2a2a2a',
    },
  },
  success: {
    text: '#55d383', // Success light color from design system
  },
  warning: {
    background: '#e8c127', // Caution light color from design system
    text: '#201004', // Caution dark color
  },
  error: {
    background: '#f17878', // Destructive light color from design system
    text: '#ffffff',
  },
};

export const SkipDepositTab = observer(() => {
  const isConnected = useIsConnected();
  const { connectWallet } = useConnectWallet();
  const [isWidgetLoading, setIsWidgetLoading] = useState(true);

  // Show loading for initial widget load
  useEffect(() => {
    if (isConnected) {
      setIsWidgetLoading(true);
      // Set a minimum loading time for better UX
      const timer = setTimeout(() => {
        setIsWidgetLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  // If wallet is not connected, show connect wallet message
  if (!isConnected) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center gap-4 p-6'>
        <div className='size-8 text-text-secondary'>
          <ArrowRightLeft className='size-full' />
        </div>
        <Text color='text.secondary' small>
          Connect wallet to use Skip Deposit
        </Text>
        <div className='w-fit'>
          <Button actionType='default' density='compact' onClick={() => void connectWallet()}>
            Connect wallet
          </Button>
        </div>
      </div>
    );
  }

  // Show skeleton while widget is loading
  if (isWidgetLoading) {
    return (
      <div className='w-full py-6 flex flex-col gap-1'>
        <div className='h-[110px] w-full rounded-2xl bg-other-tonal-fill5 relative overflow-hidden before:absolute before:top-1/2 before:left-1/2 before:h-full before:w-full before:content-[""] before:-translate-x-1/2 before:-translate-y-1/2 before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-other-tonal-fill5 before:to-transparent' />
        <div className='h-[110px] w-full rounded-2xl bg-other-tonal-fill5 relative overflow-hidden before:absolute before:top-1/2 before:left-1/2 before:h-full before:w-full before:content-[""] before:-translate-x-1/2 before:-translate-y-1/2 before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-other-tonal-fill5 before:to-transparent' />
        <div className='h-[70px] w-full rounded-2xl bg-other-tonal-fill5 relative overflow-hidden before:absolute before:top-1/2 before:left-1/2 before:h-full before:w-full before:content-[""] before:-translate-x-1/2 before:-translate-y-1/2 before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-other-tonal-fill5 before:to-transparent' />
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Skip Widget */}
      <Widget
        defaultRoute={defaultRoute}
        filter={filter}
        theme={theme}
        enableAmplitudeAnalytics={false}
      />
    </div>
  );
});
