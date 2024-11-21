import { penumbraContext } from '../context/penumbra-context.js';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  PenumbraContextInput,
  resolvePenumbraContextInput,
} from '../context/penumbra-context-input.js';
import { PenumbraEventDetail } from '@penumbra-zone/client';

export const PenumbraContextProvider = ({
  client,
  provider,
  children,
}: PenumbraContextInput & { children?: ReactNode }) => {
  const penumbra = useMemo(
    () => resolvePenumbraContextInput({ client, provider }),
    [client, provider],
  );

  const [providerState, setProviderState] = useState(penumbra.state);
  const [providerConnected, setProviderConnected] = useState(penumbra.connected);

  useEffect(() => {
    console.log('setting providerConnected', providerState, penumbra.connected);
    setProviderConnected(penumbra.connected);
  }, [penumbra, providerState]);

  const listener = useCallback((update: PenumbraEventDetail<'penumbrastate'>) => {
    console.log('listener', update);
    setProviderState(update.state);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    penumbra.onConnectionStateChange(listener, ac.signal);
    return () => ac.abort();
  }, [penumbra, listener]);

  console.log('providerConnected', providerConnected);

  return (
    <penumbraContext.Provider value={providerConnected ? penumbra : penumbra}>
      {children}
    </penumbraContext.Provider>
  );
};
