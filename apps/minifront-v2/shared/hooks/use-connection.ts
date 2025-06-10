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
    const availableProviders = Object.keys(PenumbraClient.getProviders());

    if (availableProviders.length === 0) {
      // No wallet installed, redirect to install
      window.open('https://praxwallet.com/', '_blank', 'noopener,noreferrer');
      return;
    }

    if (availableProviders.length === 1 && availableProviders[0]) {
      try {
        await penumbra.connect(availableProviders[0]);
      } catch (error) {
        // Optionally handle error
      }
    } else if (availableProviders.length > 1) {
      // Multiple providers - connect to first one for now
      // TODO: Show provider selection dialog
      try {
        const firstProvider = availableProviders[0];
        if (firstProvider) {
          await penumbra.connect(firstProvider);
        }
      } catch (error) {
        // Optionally handle error
      }
    }
  };

  return { connectWallet };
};
