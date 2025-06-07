import { useState, useEffect } from 'react';
import { penumbra } from '@shared/lib/penumbra';
import { PenumbraClient } from '@penumbra-zone/client';

export const useIsConnected = (): boolean => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check initial connection state
    setConnected(Boolean(penumbra.connected));

    // Listen for connection state changes
    const unsubscribe = penumbra.onConnectionStateChange(() => {
      setConnected(Boolean(penumbra.connected));
    });

    return unsubscribe;
  }, []);

  return connected;
};

export const useConnectWallet = () => {
  const connectWallet = async () => {
    console.log('Connect wallet clicked');
    const availableProviders = Object.keys(PenumbraClient.getProviders());
    console.log('Available providers:', availableProviders);

    if (availableProviders.length === 0) {
      console.log('No wallet installed, redirecting to install');
      // No wallet installed, redirect to install
      window.open('https://praxwallet.com/', '_blank', 'noopener,noreferrer');
      return;
    }

    if (availableProviders.length === 1 && availableProviders[0]) {
      console.log('Connecting to single provider:', availableProviders[0]);
      try {
        await penumbra.connect(availableProviders[0]);
        console.log('Connection successful');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else if (availableProviders.length > 1) {
      console.log('Multiple providers available, connecting to first:', availableProviders[0]);
      // Multiple providers - connect to first one for now
      // TODO: Show provider selection dialog
      try {
        const firstProvider = availableProviders[0];
        if (firstProvider) {
          await penumbra.connect(firstProvider);
          console.log('Connection to first provider successful');
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return { connectWallet };
};
