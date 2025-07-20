import { observer } from 'mobx-react-lite';
import { Widget } from '@skip-go/widget';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
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
