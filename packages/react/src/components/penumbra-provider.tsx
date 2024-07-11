import {
  isPenumbraInjectionStateEvent,
  PenumbraInjection,
  PenumbraInjectionState,
} from '@penumbra-zone/client';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PenumbraManifest } from '../manifest';
import { PenumbraContext, penumbraContext } from '../penumbra-context';
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

  const [providerState, setProviderState] = useState(providerInjection?.state());
  const [providerConnected, setProviderConnected] = useState(providerInjection?.isConnected());

  const [failure, setFailureError] = useState<Error>();
  const setFailureUnknown = useCallback(
    (cause: unknown) =>
      failure
        ? console.error('Not replacing existing PenumbraProvider failure', { failure, cause })
        : setFailureError(cause instanceof Error ? cause : new Error('Unknown failure', { cause })),
    [failure, setFailureError],
  );

  const providerStateListener = useCallback(
    (evt: Event) => {
      console.log('penumbrastate', evt); // TODO: remove
      if (!isPenumbraInjectionStateEvent(evt)) return;
      const detail = evt.detail;
      if (!providerInjection) setFailureError(new Error('State change without injection'));
      else if (detail.origin !== providerOrigin)
        setFailureError(new Error('State change from unexpected origin'));
      else if (detail.state !== providerInjection.state())
        console.warn('State change not verifiable');
      else {
        setProviderState(providerInjection.state());
        setProviderConnected(providerInjection.isConnected());
      }
    },
    [providerInjection, providerOrigin, providerInjection?.state, providerInjection?.isConnected],
  );

  useEffect(() => {
    const eventListener = providerStateListener;
    const { addEventListener, removeEventListener } = providerInjection ?? {};
    if (!addEventListener || !removeEventListener) return;
    addEventListener('penumbrastate', eventListener);
    return () => removeEventListener('penumbrastate', eventListener);
  }, [
    providerInjection,
    providerInjection?.addEventListener,
    providerInjection?.removeEventListener,
    providerStateListener,
  ]);

  const [providerPort, setProviderPort] = useState<MessagePort>();
  const [manifest, setManifest] = useState<PenumbraManifest>();

  const createdContext: PenumbraContext = useMemo(
    () => ({
      failure,
      manifest,
      origin: providerOrigin,

      // require manifest to forward state
      state: manifest && providerState,

      // require manifest and no failures to forward injected methods
      ...(manifest && !failure
        ? {
            port: providerConnected && providerPort,
            connect: providerInjection?.connect,
            request: providerInjection?.request,
            disconnect: providerInjection?.disconnect,
          }
        : {}),
    }),
    [
      failure,
      manifest,
      providerPort,
      providerInjection?.connect,
      providerInjection?.connect,
      providerInjection?.disconnect,
      providerOrigin,
      providerState,
    ],
  );

  // fetch manifest to confirm presence of provider
  useEffect(() => {
    // require provider
    if (!providerOrigin || !providerInjection) return;
    // don't repeat, unnecessary if failed
    if (!!manifest || failure) return;

    // sync assertion
    try {
      assertManifestOrigin(providerOrigin, providerInjection);
    } catch (cause) {
      setFailureUnknown(cause);
      return;
    }

    // async fetch
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
      .catch(setFailureUnknown);

    // useEffect cleanup
    return () => ac.abort();
  }, [providerOrigin, providerInjection, manifest, setManifest]);

  // request effect
  useEffect(() => {
    // require manifest, no failures
    if (!manifest || failure) return;

    switch (providerState) {
      case PenumbraInjectionState.Present:
        if (makeApprovalRequest) void providerInjection?.request().catch(setFailureUnknown);
        break;
      default:
        break;
    }
  }, [makeApprovalRequest, providerState, providerInjection?.request, manifest, failure]);

  // connect effect
  useEffect(() => {
    // require manifest, no failures
    if (!manifest || failure) return;

    switch (providerState) {
      case PenumbraInjectionState.Present:
        if (!makeApprovalRequest)
          void providerInjection
            ?.connect()
            .then(p => setProviderPort(p))
            .catch(setFailureUnknown);
        break;
      case PenumbraInjectionState.Requested:
        void providerInjection
          ?.connect()
          .then(p => setProviderPort(p))
          .catch(setFailureUnknown);
        break;
      default:
        break;
    }
  }, [makeApprovalRequest, providerState, providerInjection?.connect, manifest, failure]);

  return <penumbraContext.Provider value={createdContext}>{children}</penumbraContext.Provider>;
};
