import {
  isPenumbraInjectionStateEvent,
  PenumbraInjection,
  PenumbraInjectionState,
} from '@penumbra-zone/client';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PenumbraManifest } from '../manifest.js';
import { PenumbraContext, penumbraContext } from '../penumbra-context.js';
import { assertManifestOrigin, injectionOfKey, keyOfInjection } from '../util.js';

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

  const [providerPort, setProviderPort] = useState<MessagePort>();
  const [manifest, setManifest] = useState<PenumbraManifest>();

  // force destruction of provider on failure
  useEffect(() => {
    if (failure) {
      setProviderState(PenumbraInjectionState.Failed);
      setProviderConnected(false);
      setProviderPort(undefined);
    }
  }, [failure]);

  // attach state event listener
  useEffect(() => {
    // require manifest, no failures
    if (!manifest || failure) {
      return;
    }

    const listener = (evt: Event) => {
      if (isPenumbraInjectionStateEvent(evt)) {
        if (!providerInjection) {
          setFailureError(new Error('State change event without injection'));
        } else if (evt.detail.origin !== providerOrigin) {
          setFailureError(new Error('State change from unexpected origin'));
        } else if (evt.detail.state !== providerInjection.state()) {
          console.warn('State change not verifiable');
        } else {
          setProviderState(providerInjection.state());
          setProviderConnected(providerInjection.isConnected());
        }
      }
    };

    const ac = new AbortController();
    providerInjection?.addEventListener('penumbrastate', listener, {
      signal: ac.signal,
    });
    return () => ac.abort();
  }, [providerInjection, providerInjection?.addEventListener, manifest, failure]);

  // fetch manifest to confirm presence of provider
  useEffect(() => {
    // require provider
    if (!providerOrigin || !providerInjection) {
      return;
    }
    // don't repeat, unnecessary if failed
    if (!!manifest || failure) {
      return;
    }

    // sync assertion
    try {
      assertManifestOrigin(providerOrigin, providerInjection);
    } catch (cause) {
      setFailureUnknown(cause);
      return;
    }

    // abortable fetch
    const ac = new AbortController();
    const fetchManifest = fetch(providerInjection.manifest, { signal: ac.signal }).catch(
      (noAbortError: unknown) => {
        // abort is not a failure
        if (noAbortError instanceof Error && noAbortError.name === 'AbortError') {
          return;
        } else {
          throw noAbortError;
        }
      },
    );

    // async handle response
    void fetchManifest
      .then(async res => {
        const manifestJson: unknown = await res?.json();
        if (manifestJson) {
          // this cast is fairly safe coming from an extension manifest, where
          // schema is enforced by chrome store.
          setManifest(manifestJson as PenumbraManifest);
        }
      })
      .catch(setFailureUnknown);

    return () => ac.abort();
  }, [providerOrigin, providerInjection, manifest, setManifest]);

  // request effect
  useEffect(() => {
    // require manifest, no failures
    if (!manifest || failure) {
      return;
    }

    switch (providerState) {
      case PenumbraInjectionState.Present:
        if (makeApprovalRequest) {
          void providerInjection?.request().catch(setFailureUnknown);
        }
        break;
      default:
        break;
    }
  }, [makeApprovalRequest, providerState, providerInjection?.request, manifest, failure]);

  // connect effect
  useEffect(() => {
    // require manifest, no failures
    if (!manifest || failure) {
      return;
    }

    switch (providerState) {
      case PenumbraInjectionState.Present:
        if (!makeApprovalRequest) {
          void providerInjection
            ?.connect()
            .then(p => setProviderPort(p))
            .catch(setFailureUnknown);
        }
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

  return <penumbraContext.Provider value={createdContext}>{children}</penumbraContext.Provider>;
};
