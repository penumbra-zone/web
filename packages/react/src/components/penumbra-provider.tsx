import { PenumbraInjection } from '@penumbra-zone/client';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PenumbraManifest } from '../manifest';
import { PenumbraContext, penumbraContext, PenumbraProviderState } from '../penumbra-context';
import { assertManifestOrigin, injectionOfKey, keyOfInjection } from '../util';

type PenumbraProviderProps = {
  children?: ReactNode;
  injection?: PenumbraInjection;
  origin?: string;
  makeApprovalRequest?: boolean;
} & ({ injection: PenumbraInjection } | { origin: string });

export const PenumbraProvider = ({
  children,
  origin: providerOrigin,
  injection: providerInjection,
  makeApprovalRequest = false,
}: PenumbraProviderProps) => {
  providerOrigin ??= keyOfInjection(providerInjection);
  providerInjection ??= injectionOfKey(providerOrigin);

  const [providerState, setProviderState] = useState<PenumbraProviderState>();

  const [failure, setFailureState] = useState<Error>();

  const setFailure = useCallback(
    (cause: unknown) => {
      setFailureState(cause instanceof Error ? cause : new Error('Unknown failure', { cause }));
      setProviderState(PenumbraProviderState.Failed);
    },
    [setFailureState, setProviderState],
  );

  const [port, setPort] = useState<MessagePort>();

  const [manifest, setManifest] = useState<PenumbraManifest>();

  const [providerConnected, setProviderConnected] = useState(providerInjection?.isConnected());

  const [calledConnect, setCalledConnect] = useState(false);
  const [calledRequest, setCalledRequest] = useState(false);
  const [calledDisconnect, setCalledDisconnect] = useState(false);

  const createdContext: PenumbraContext = useMemo(
    () => ({
      failure,
      manifest,
      origin: providerOrigin,
      state: providerState,
      ...(manifest && !failure
        ? {
            port,
            connect:
              providerInjection?.connect &&
              (async () => {
                setCalledConnect(true);
                await providerInjection.connect();
              }),
            request:
              providerInjection?.request &&
              (async () => {
                setCalledRequest(true);
                await providerInjection.request();
              }),
            disconnect:
              providerInjection?.disconnect &&
              (async () => {
                setCalledDisconnect(true);
                await providerInjection.disconnect();
              }),
          }
        : {}),
    }),
    [
      failure,
      manifest,
      port,
      providerInjection?.connect,
      providerInjection?.connect,
      providerInjection?.disconnect,
      providerOrigin,
      providerState,
    ],
  );

  // track state including what methods have been called
  useEffect(() => {
    setProviderConnected(providerInjection?.isConnected());

    if (failure) setProviderState(PenumbraProviderState.Failed);
    else if (!providerOrigin || !providerInjection) setProviderState(PenumbraProviderState.Absent);
    else if (!manifest) setProviderState(PenumbraProviderState.Injected);
    else if (calledDisconnect) setProviderState(PenumbraProviderState.Disconnected);
    else if (providerConnected) setProviderState(PenumbraProviderState.Connected);
    else if (calledRequest) setProviderState(PenumbraProviderState.Requested);
    else if (calledConnect) setProviderState(PenumbraProviderState.Pending);
    else setProviderState(PenumbraProviderState.Present);
  }, [
    calledConnect,
    calledDisconnect,
    calledRequest,
    failure,
    manifest,
    providerConnected,
    providerInjection,
    providerOrigin,
  ]);

  // fetch manifest to confirm presence of provider
  useEffect(() => {
    // don't repeat
    if (failure ?? manifest) return;
    // don't attempt with no provider
    if (!providerOrigin || !providerInjection) return;

    // sync assertion
    try {
      assertManifestOrigin(providerOrigin, providerInjection);
    } catch (cause) {
      setFailure(cause);
      return;
    }

    // async fetch, returning abort function for cancel
    const ac = new AbortController();
    void fetch(providerInjection.manifest, { signal: ac.signal })
      .then(
        async res => {
          // this cast is fairly safe coming from an extension manifest, where
          // schema is enforced by chrome store.
          const manifestJson = (await res.json()) as PenumbraManifest;
          setManifest(manifestJson);
        },
        (noAbortError: unknown) => {
          // abort is not a failure
          if (noAbortError instanceof Error && noAbortError.name === 'AbortError') return;
          else throw noAbortError;
        },
      )
      .catch(setFailure);
    return () => ac.abort();
  }, [providerOrigin, providerInjection, manifest]);

  // connect effect
  useEffect(() => {
    // don't request if already finished
    if (calledDisconnect || failure) return;
    // don't repeat connection
    if (calledConnect || port) return;
    // don't connect early
    if (makeApprovalRequest && !calledRequest) return;
    // wait for manifest confirmed and method available
    if (!manifest || !providerInjection?.connect) return;

    void providerInjection
      .connect()
      .then(p => setPort(p), setFailure)
      .finally(() => setProviderConnected(providerInjection.isConnected()));

    setCalledConnect(true);
  }, [
    calledConnect,
    calledDisconnect,
    calledRequest,
    failure,
    makeApprovalRequest,
    manifest,
    port,
    providerConnected,
    providerInjection,
  ]);

  // approval request effect
  useEffect(() => {
    // don't request if already finished
    if (calledDisconnect || failure) return;
    // don't repeat request, only make request if configured
    if (calledRequest || !makeApprovalRequest) return;
    // wait for manifest confirmed and method available
    if (!manifest || !providerInjection?.request) return;

    void providerInjection.request();
    setCalledRequest(true);
  }, [calledRequest, makeApprovalRequest, manifest, providerInjection?.request]);

  return <penumbraContext.Provider value={createdContext}>{children}</penumbraContext.Provider>;
};
