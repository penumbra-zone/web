import { useEffect, useState } from 'react';
import { isPenumbraInstalled, penumbra } from '../penumbra.ts';
import { PenumbraState } from '@penumbra-zone/client';

export const useConnect = () => {
  const [connected, setConnected] = useState(penumbra.connected ?? false);
  const installed = isPenumbraInstalled();

  useEffect(() => {
    penumbra.onConnectionStateChange((event) => {
      if (event.state === PenumbraState.Connected) {
        setConnected(true);
      } else {
        setConnected(false);
      }
    });
  }, []);

  const connect = () => {
    try {
      void penumbra.connect();
    } catch (error) {
      // TODO: handle error (probably with toasts)
      console.error(error);
    }
  };

  const disconnect = () => {
    try {
      void penumbra.disconnect();
    } catch (error) {
      // TODO: handle error (probably with toasts)
      console.error(error);
    }
  };

  return {
    connected,
    installed,
    connect,
    disconnect,
  };
};
