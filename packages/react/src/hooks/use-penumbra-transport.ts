import {
  type ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { useEffect, useMemo, useState } from 'react';
import { usePenumbra } from './use-penumbra.js';
import { PenumbraInjectionState } from '@penumbra-zone/client';

/** Unconditionally returns a Transport to the provided Penumbra context. This
 * transport will always create synchronously, but may reject all requests if
 * the Penumbra context does not provide a port within your configured
 * defaultTimeoutMs (defaults to 10 seconds). */
export const usePenumbraTransportSync = (opts?: Omit<ChannelTransportOptions, 'getPort'>) => {
  const penumbra = usePenumbra();
  const { port, failure, state } = penumbra;

  // use a local promise to avoid re-rendering when the port is set
  const [{ resolve: resolvePort, reject: rejectPort, promise: portPromise }] = useState(
    Promise.withResolvers<MessagePort>(),
  );

  // memoize the transport to avoid re-creating it on every render
  const transport = useMemo(
    () => createChannelTransport({ ...opts, getPort: () => portPromise }),
    [portPromise],
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

/** Promises a Transport to the provided Penumbra context.  Awaits confirmation
 * of a MessagePort to the provider in context before attempting to create the
 * Transport, so this will not time out if approval takes very long - but it
 * must be async. The returned promise may reject with a connection failure. */
export const usePenumbraTransport = (opts?: Omit<ChannelTransportOptions, 'getPort'>) => {
  const penumbra = usePenumbra();
  const { port, failure, state } = penumbra;

  // use a local promise to avoid re-rendering when the port is set
  const [{ resolve: resolvePort, reject: rejectPort, promise: portPromise }] = useState(
    Promise.withResolvers<MessagePort>(),
  );

  // memoize the transport to avoid re-creating it on every render
  const transportPromise = useMemo(
    () => portPromise.then(() => createChannelTransport({ ...opts, getPort: () => portPromise })),
    [portPromise],
  );

  // handle context updates
  useEffect(() => {
    if (port) {
      resolvePort(port);
    } else if (failure ?? state === PenumbraInjectionState.Failed) {
      rejectPort(failure ?? new Error('Unknown failure'));
    }
  }, [failure, penumbra, port, resolvePort, rejectPort, state]);

  switch (state) {
    case PenumbraInjectionState.Disconnected:
    case PenumbraInjectionState.Failed:
      return Promise.reject(failure ?? new Error(state));
    default:
      return transportPromise;
  }
};
