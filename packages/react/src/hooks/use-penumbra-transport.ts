import { jsonOptions } from '@penumbra-zone/protobuf';
import { createChannelTransport } from '@penumbra-zone/transport-dom/create';
import { useEffect, useMemo, useState } from 'react';
import { usePenumbra } from './use-penumbra';

export const usePenumbraTransport = () => {
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
        getPort: () => portPromise,
        jsonOptions,
      }),
    [portPromise],
  );

  // handle context updates
  useEffect(() => {
    if (port) resolvePort(port);
    else if (failure) rejectPort(failure);
  }, [failure, penumbra, port, resolvePort, rejectPort, state]);

  return transport;
};
