import { useEffect, useState } from 'react';
import { penumbra, PRAX_ORIGIN } from '@/utils/penumbra/penumbra.ts';
import { PenumbraRequestFailure, PenumbraState, PenumbraManifest } from '@penumbra-zone/client';

export const useConnect = () => {
  const [manifest, setManifest] = useState<PenumbraManifest>();
  const [connectionLoading, setConnectionLoading] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  const reconnect = async () => {
    await penumbra.attach(PRAX_ORIGIN);
    if (!penumbra.connected) {
      return;
    }

    try {
      await penumbra.connect();
      setConnected(true);
    } catch (error) {
      /* no-op */
    }
  };

  const connect = async () => {
    try {
      setConnectionLoading(true);
      await penumbra.connect();
    } catch (error) {
      if (error instanceof Error && error.cause) {
        if (error.cause === PenumbraRequestFailure.Denied) {
          // TODO: replace these alerts with toasts
          alert('Connection denied: you may need to un-ignore this site in your extension settings.');
        }
        if (error.cause === PenumbraRequestFailure.NeedsLogin) {
          alert('Not logged in: please login into the extension and try again');
        }
      }
    } finally {
      setConnectionLoading(false);
    }
  };

  const disconnect = async () => {
    if (!penumbra.connected) {
      return;
    }

    try {
      await penumbra.disconnect();
    } catch (error) {
      console.error(error);
    }
  };

  // Monitors the connection
  useEffect(() => {
    setManifest(penumbra.manifest);

    // If Prax is connected on page load, reconnect to ensure the connection is still active
    void reconnect();

    penumbra.onConnectionStateChange((event) => {
      setManifest(penumbra.manifest);
      if (event.state === PenumbraState.Connected) {
        setConnected(true);
      } else {
        setConnected(false);
      }
    });
  }, []);

  return {
    manifest,
    connectionLoading,
    connected,
    connect,
    disconnect,
  }
};
