import {
  type ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { useEffect, useMemo, useState } from 'react';
import { usePenumbra } from './use-penumbra.js';
import { PenumbraState } from '@penumbra-zone/client';

export const usePenumbraTransport = () => usePenumbra().transport;

/** This method immediately returns a new, unshared Transport to the surrounding
 * Penumbra context. This transport will always create synchronously, but may
 * time out and reject all requests if the Penumbra context does not provide a
 * port within your configured defaultTimeoutMs (defaults to 60 seconds). */
export const usePenumbraTransportSync = (opts?: Omit<ChannelTransportOptions, 'getPort'>) => {
  const penumbra = usePenumbra();
  const { port, failure, state } = penumbra;

  // use a local promise to avoid re-rendering when the port is set
  const [{ resolve: resolvePort, reject: rejectPort, promise: portPromise }] = useState(
    Promise.withResolvers<MessagePort>(),
  );

  // memoize the transport to avoid re-creating it on every render
  const transport = useMemo(
    () =>
      createChannelTransport({
        ...penumbra.transportOpts,
        ...opts,
        getPort: () => portPromise,
      }),
    [penumbra, portPromise, opts],
  );

  // handle context updates
  useEffect(() => {
    if (port) {
      resolvePort(port);
    } else if (failure) {
      rejectPort(failure);
    }
  }, [failure, penumbra, port, resolvePort, rejectPort, state]);

  return transport;
};

/** This method Promises a new, unshared Transport to the provided Penumbra
 * context.  Awaits confirmation of a MessagePort to the provider in context
 * before attempting to create the Transport, so this will not time out if
 * approval takes very long - but it must be async. The returned promise may
 * reject with a connection failure. */
export const usePenumbraTransportAsync = (opts?: Omit<ChannelTransportOptions, 'getPort'>) => {
  const penumbra = usePenumbra();
  const { port, failure, state } = penumbra;

  // use a local promise to avoid re-rendering when the port is set
  const [{ resolve: resolvePort, reject: rejectPort, promise: portPromise }] = useState(
    Promise.withResolvers<MessagePort>(),
  );

  // memoize the transport to avoid re-creating it on every render
  const transportPromise = useMemo(
    () =>
      portPromise.then(() =>
        createChannelTransport({
          ...penumbra.transportOpts,
          ...opts,
          getPort: () => portPromise,
        }),
      ),
    [penumbra, portPromise, opts],
  );

  // handle context updates
  useEffect(() => {
    if (port) {
      resolvePort(port);
    } else if (failure ?? state === PenumbraState.Failed) {
      rejectPort(failure ?? new Error('Unknown failure'));
    }
  }, [failure, penumbra, port, resolvePort, rejectPort, state]);

  switch (state) {
    case PenumbraState.Disconnected:
    case PenumbraState.Failed:
      return Promise.reject(failure ?? new Error(state));
    default:
      return transportPromise;
  }
};
