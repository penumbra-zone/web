import { useEffect, useMemo, useState } from 'react';
import { Link2Off, Wallet2, Download } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Popover } from '@penumbra-zone/ui/Popover';
import { Button } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { Text } from '@penumbra-zone/ui/Text';
import { penumbra } from '@shared/lib/penumbra';
import { PenumbraManifest, PenumbraClient } from '@penumbra-zone/client';
import {
  useAppParametersStore,
  useBalancesStore,
  useTransactionsStore,
} from '@shared/stores/store-context';
import { useIsConnected } from '@shared/hooks/use-connection';

const usePenumbraManifest = (): PenumbraManifest | undefined => {
  const [manifest, setManifest] = useState<PenumbraManifest>();

  useEffect(() => {
    setManifest(penumbra.manifest);
    penumbra.onConnectionStateChange(() => {
      setManifest(penumbra.manifest);
    });
  }, []);

  return manifest;
};

const useAvailableProviders = () => {
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    const updateProviders = () => {
      const availableProviders = Object.keys(PenumbraClient.getProviders());
      setProviders(availableProviders);
    };

    updateProviders();

    // Check periodically for new providers
    const interval = setInterval(updateProviders, 1000);

    return () => clearInterval(interval);
  }, []);

  return providers;
};

export const ProviderPopover = observer(() => {
  const manifest = usePenumbraManifest();
  const isConnected = useIsConnected();
  const availableProviders = useAvailableProviders();
  const appParametersStore = useAppParametersStore();
  const balancesStore = useBalancesStore();
  const transactionsStore = useTransactionsStore();

  const icon = useMemo(() => {
    const icons = manifest?.icons;
    const blob = icons?.['32'] ?? icons?.['128'];
    if (!blob) return null;

    return (
      <img
        src={URL.createObjectURL(blob)}
        alt={`${manifest?.name} Icon`}
        className='w-6 h-6 max-w-none grayscale' // Smaller size and black/white
      />
    );
  }, [manifest]);

  const disconnect = () => {
    void penumbra.disconnect().then(() => window.location.reload());
  };

  const connectWallet = async () => {
    if (availableProviders.length === 1 && availableProviders[0]) {
      try {
        await penumbra.connect(availableProviders[0]);
        // Refresh all stores after successful connection
        await Promise.all([
          appParametersStore.refresh(),
          balancesStore.loadBalances(),
          transactionsStore.loadTransactions(),
        ]);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else if (availableProviders.length > 1) {
      // TODO: Show provider selection dialog
      // For now, just connect to the first one
      try {
        await penumbra.connect(availableProviders[0]!);
        // Refresh all stores after successful connection
        await Promise.all([
          appParametersStore.refresh(),
          balancesStore.loadBalances(),
          transactionsStore.loadTransactions(),
        ]);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const installWallet = () => {
    window.open('https://praxwallet.com/', '_blank', 'noopener,noreferrer');
  };

  // If wallet is installed but not connected
  if (availableProviders.length > 0 && !isConnected) {
    return (
      <Button actionType='default' density='compact' icon={Wallet2} onClick={connectWallet}>
        <span className='text-sm'>Connect Wallet</span>
      </Button>
    );
  }

  // If no wallet is installed
  if (availableProviders.length === 0) {
    return (
      <Button actionType='default' density='compact' icon={Download} onClick={installWallet}>
        <span className='text-sm'>Install Wallet</span>
      </Button>
    );
  }

  // If connected and have manifest, show the full popover
  if (isConnected && manifest) {
    const chainId = appParametersStore.chainId || 'penumbra-1';

    return (
      <Popover>
        <Popover.Trigger>
          <Button
            actionType='default'
            density='compact'
            iconOnly
            icon={() => icon}
            aria-label={`${manifest.name} - ${chainId}`}
          >
            {manifest.name}
          </Button>
        </Popover.Trigger>
        <Popover.Content align='end' side='bottom'>
          <Density compact>
            <div className='flex flex-col gap-4 text-text-primary min-w-60 w-full'>
              <div className='flex flex-col gap-2 ml-4'>
                <Text h4>
                  {manifest.name} {manifest.version}
                </Text>
                <Text detail color='text.muted'>
                  Chain: {chainId}
                </Text>
                <Text detail color='text.muted'>
                  {manifest.description}
                </Text>
              </div>

              <Button onClick={disconnect} actionType='destructive' icon={Link2Off}>
                Disconnect
              </Button>
            </div>
          </Density>
        </Popover.Content>
      </Popover>
    );
  }

  // Fallback: show connect wallet
  return (
    <Button actionType='default' density='compact' icon={Wallet2} onClick={connectWallet}>
      <span className='text-sm'>Connect Wallet</span>
    </Button>
  );
});
