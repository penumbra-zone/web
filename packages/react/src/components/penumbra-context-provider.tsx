import { getPenumbraManifest, PenumbraProvider, PenumbraState } from '@penumbra-zone/client';
import { isPenumbraStateEvent } from '@penumbra-zone/client/event';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PenumbraContext, penumbraContext } from '../penumbra-context.js';
import { PenumbraManifest } from '@penumbra-zone/client/manifest';
import {
  ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { jsonOptions } from '@penumbra-zone/protobuf';
import { assertProviderRecord } from '@penumbra-zone/client/assert';

type PenumbraContextProviderProps = {
  children?: ReactNode;
  origin: string;
  makeApprovalRequest?: boolean;
  transportOpts?: Omit<ChannelTransportOptions, 'getPort'>;
} & ({ provider: PenumbraProvider } | { origin: string });

export const PenumbraContextProvider = ({
  children,
  origin: providerOrigin,
  makeApprovalRequest = false,
  transportOpts,
}: PenumbraContextProviderProps) => {
  const penumbra = assertProviderRecord(providerOrigin);

  const [providerConnected, setProviderConnected] = useState<boolean>();
  const [providerManifest, setProviderManifest] = useState<PenumbraManifest>();
  const [providerPort, setProviderPort] = useState<MessagePort>();
  const [providerState, setProviderState] = useState<PenumbraState>();
  const [failure, dispatchFailure] = useState<Error>();

  // force destruction on any failure
  const setFailure = useCallback(
    (cause: unknown) => {
      if (failure) {
        console.warn('PenumbraContextProvider not replacing existing failure with new cause', {
          failure,
          cause,
        });
      }

      setProviderConnected(false);
      setProviderPort(undefined);
      setProviderState(PenumbraState.Failed);
      dispatchFailure(
        failure ?? (cause instanceof Error ? cause : new Error('Unknown failure', { cause })),
      );
    },
    [failure],
  );

  // fetch manifest to confirm presence of provider
  useEffect(() => {
    // require origin. skip if failure or manifest present
    if (!providerOrigin || (failure ?? providerManifest)) {
      return;
    }

    // abortable effect
    const ac = new AbortController();

    void getPenumbraManifest(providerOrigin, ac.signal)
      .then(manifestJson => ac.signal.aborted || setProviderManifest(manifestJson))
      .catch(setFailure);

    return () => ac.abort();
  }, [providerOrigin, penumbra, providerManifest, setProviderManifest]);

  // attach state event listener
  useEffect(() => {
    // require manifest. unnecessary if failed
    if (!providerManifest || failure) {
      return;
    }

    // abortable listener
    const ac = new AbortController();
    penumbra.addEventListener(
      'penumbrastate',
      (evt: Event) => {
        if (isPenumbraStateEvent(evt)) {
          if (evt.detail.origin !== providerOrigin) {
            setFailure(new Error('State change from unexpected origin'));
          } else if (evt.detail.state !== penumbra.state()) {
            console.warn('State change not verifiable');
          } else {
            setProviderState(penumbra.state());
            setProviderConnected(penumbra.isConnected());
          }
        }
      },
      { signal: ac.signal },
    );
    return () => ac.abort();
  }, [penumbra, penumbra.addEventListener, providerManifest, failure]);

  // request effect
  useEffect(() => {
    // require manifest, no failures
    if (providerManifest && !failure) {
      switch (providerState) {
        case PenumbraState.Present:
          if (makeApprovalRequest) {
            void penumbra.request().catch(setFailure);
          }
          break;
        default:
          break;
      }
    }
  }, [makeApprovalRequest, providerState, penumbra.request, providerManifest, failure]);

  // connect effect
  useEffect(() => {
    // require manifest, no failures
    if (providerManifest && !failure) {
      switch (providerState) {
        case PenumbraState.Present:
          if (!makeApprovalRequest) {
            void penumbra
              .connect()
              .then(p => setProviderPort(p))
              .catch(setFailure);
          }
          break;
        case PenumbraState.Requested:
          void penumbra
            .connect()
            .then(p => setProviderPort(p))
            .catch(setFailure);
          break;
        default:
          break;
      }
    }
  }, [makeApprovalRequest, providerState, penumbra.connect, providerManifest, failure]);

  const createdContext: PenumbraContext = useMemo(
    () => ({
      failure,
      manifest: providerManifest,
      origin: providerOrigin,

      // require manifest to forward state
      state: providerManifest && providerState,
      transport:
        providerConnected && providerPort
          ? createChannelTransport({
              jsonOptions,
              ...transportOpts,
              getPort: () => Promise.resolve(providerPort),
            })
          : undefined,
      transportOpts,

      // require manifest and no failures to forward injected methods
      ...(providerManifest && !failure
        ? {
            port: providerConnected && providerPort,
            connect: penumbra.connect,
            request: penumbra.request,
            disconnect: penumbra.disconnect,

            addEventListener: penumbra.addEventListener,
            removeEventListener: penumbra.removeEventListener,
          }
        : {}),
    }),
    [
      failure,
      penumbra.connect,
      penumbra.connect,
      penumbra.disconnect,
      providerManifest,
      providerOrigin,
      providerPort,
      providerState,
      transportOpts,
    ],
  );

  return <penumbraContext.Provider value={createdContext}>{children}</penumbraContext.Provider>;
};
