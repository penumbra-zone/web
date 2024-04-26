/**
 * This file is injected by the extension as a content script, to create the
 * mainworld global that allows pages to detect installed providers and connect
 * to them.
 *
 * The global is identified by `Symbol.for('penumbra')` and consists
 * of a record with string keys referring to `PenumbraProvider` objects that
 * contain a simple api. The identifiers on this record should be unique and
 * correspond to an id in a manifest, and providers should provide a link to
 * the manifest in their record entry.
 *
 *
 * The global is frozen to prevent mutation, but you should consider that the
 * global and everything on it is only as trustable as the scripts running on
 * the page - imports, includes, and packages your webapp depends on could all
 * mutate or preempt the global. User-agent injections like userscripts or
 * other content scripts could interfere or intercept connections.
 */

import {
  PenumbraProvider,
  PenumbraRequestFailure,
  PenumbraSymbol,
} from '@penumbra-zone/client/src/global';
import { isPraxFailureMessageEvent, isPraxPortMessageEvent, PraxMessage } from './message-event';

import '@penumbra-zone/polyfills/Promise.withResolvers';
import { PraxConnection } from '../message/prax';

const request = Promise.withResolvers();

// this is just withResolvers, plus a sync-queryable state attribute
const connection = Object.assign(Promise.withResolvers<MessagePort>(), { state: false });
connection.promise.then(
  () => {
    connection.state = true;
    request.resolve();
  },
  () => {
    connection.state = false;
    request.reject();
  },
);

// this resolves the connection promise when the isolated port script indicates
const connectionListener = (msg: MessageEvent<unknown>) => {
  if (isPraxPortMessageEvent(msg) && msg.origin === window.origin) {
    // @ts-expect-error - ts can't understand the injected string
    const praxPort: unknown = msg.data[PRAX];
    if (praxPort instanceof MessagePort) connection.resolve(praxPort);
  }
};
window.addEventListener('message', connectionListener);
void connection.promise.finally(() => window.removeEventListener('message', connectionListener));

// declared outside of postRequest to prevent attaching multiple identical listeners
const requestResponseListener = (msg: MessageEvent<unknown>) => {
  if (msg.origin === window.origin) {
    if (isPraxFailureMessageEvent(msg)) {
      // @ts-expect-error - ts can't understand the injected string
      const status = msg.data[PRAX] as PraxConnection;
      const failure = new Error('Connection request failed');
      switch (status) {
        case PraxConnection.Denied:
          failure.cause = PenumbraRequestFailure.Denied;
          break;
        case PraxConnection.NeedsLogin:
          failure.cause = PenumbraRequestFailure.NeedsLogin;
          break;
        default:
          failure.cause = 'Unknown';
          break;
      }
      request.reject(failure);
    }
  }
};

// Called to request a connection to the extension.
const postRequest = () => {
  if (!connection.state) {
    window.addEventListener('message', requestResponseListener);
    window.postMessage(
      {
        [PRAX]: PraxConnection.Request,
      } satisfies PraxMessage<PraxConnection.Request>,
      window.origin,
    );
    request.promise
      .catch((e: unknown) => connection.reject(e))
      .finally(() => window.removeEventListener('message', requestResponseListener));
  }
  return request.promise;
};

// the actual object we attach to the global record, frozen
const praxProvider: PenumbraProvider = Object.freeze({
  manifest: `${PRAX_ORIGIN}/manifest.json`,
  connect: () => connection.promise,
  isConnected: () => connection.state,
  request: () => postRequest(),
});

// if the global isn't present, create it.
if (!window[PenumbraSymbol]) {
  Object.defineProperty(window, PenumbraSymbol, { value: {}, writable: false });
}

// reveal
Object.defineProperty(window[PenumbraSymbol], PRAX_ORIGIN, {
  value: praxProvider,
  writable: false,
  enumerable: true,
});
