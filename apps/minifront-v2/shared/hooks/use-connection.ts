import { useState, useEffect } from 'react';
import { penumbra } from '@shared/lib/penumbra';
import { PenumbraClient } from '@penumbra-zone/client';

export const useIsConnected = (): boolean => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      // More robust check: must have both connected state AND manifest
      const isConnected = (penumbra.connected ?? false) && !!penumbra.manifest;
      return isConnected;
    };

    setConnected(checkConnection());

    penumbra.onConnectionStateChange(() => {
      const newConnected = checkConnection();
      console.log('useIsConnected - connection state changed to:', newConnected);
      setConnected(newConnected);
    });
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
        console.error('Failed to connect wallet:', error);
      }
    } else if (availableProviders.length > 1) {
      // Multiple providers - connect to first one for now
      // TODO: Show provider selection dialog
      try {
        await penumbra.connect(availableProviders[0]!);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return { connectWallet };
};
