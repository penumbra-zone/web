import { getPenumbraManifest, PenumbraProvider, PenumbraState } from '@penumbra-zone/client';
import { isPenumbraStateEvent } from '@penumbra-zone/client/event';
import { PenumbraManifest } from '@penumbra-zone/client/manifest';
import { jsonOptions } from '@penumbra-zone/protobuf';
import {
  ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PenumbraContext, penumbraContext } from '../penumbra-context.js';

interface PenumbraContextProviderProps {
  children?: ReactNode;
  penumbra?: PenumbraProvider;
  makeApprovalRequest?: boolean;
  transportOpts?: Omit<ChannelTransportOptions, 'getPort'>;
} 

export const PenumbraContextProvider = ({
  children,
  penumbra,
  makeApprovalRequest = false,
  transportOpts,
}: PenumbraContextProviderProps) => {
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
    // require provider manifest uri, skip if failure or manifest present
    if (!penumbra?.manifest || (failure ?? providerManifest)) {
      return;
    }

    // abortable effect
    const ac = new AbortController();

    void getPenumbraManifest(new URL(penumbra.manifest).origin, ac.signal)
      .then(manifestJson => ac.signal.aborted || setProviderManifest(manifestJson))
      .catch(setFailure);

    return () => ac.abort();
  }, [failure, penumbra?.manifest, providerManifest, setFailure, setProviderManifest]);

  // attach state event listener
  useEffect(() => {
    // require penumbra, manifest. unnecessary if failed
    if (!penumbra || !providerManifest || failure) {
      return;
    }

    // abortable listener
    const ac = new AbortController();
    penumbra.addEventListener(
      'penumbrastate',
      (evt: Event) => {
        if (isPenumbraStateEvent(evt)) {
          if (evt.detail.origin !== new URL(penumbra.manifest).origin) {
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
  }, [failure, penumbra?.addEventListener, providerManifest, penumbra?.manifest, setFailure]);

  // request effect
  useEffect(() => {
    // require penumbra, manifest, no failures
    if (penumbra?.request && providerManifest && !failure) {
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
  }, [
    failure,
    makeApprovalRequest,
    penumbra?.request,
    providerManifest,
    providerState,
    setFailure,
  ]);

  // connect effect
  useEffect(() => {
    // require manifest, no failures
    if (penumbra && providerManifest && !failure) {
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
  }, [
    failure,
    makeApprovalRequest,
    penumbra?.connect,
    providerManifest,
    providerState,
    setFailure,
  ]);

  const createdContext: PenumbraContext = useMemo(
    () => ({
      failure,
      manifest: providerManifest,
      origin: penumbra?.manifest && new URL(penumbra.manifest).origin,

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

      // require penumbra, manifest and no failures to forward injected things
      ...(penumbra && providerManifest && !failure
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
      penumbra?.addEventListener,
      penumbra?.connect,
      penumbra?.disconnect,
      penumbra?.manifest,
      penumbra?.removeEventListener,
      penumbra?.request,
      providerConnected,
      providerManifest,
      providerPort,
      providerState,
      transportOpts,
    ],
  );

  return <penumbraContext.Provider value={createdContext}>{children}</penumbraContext.Provider>;
};
