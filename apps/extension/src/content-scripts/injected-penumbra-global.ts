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

import { PenumbraSymbol, PenumbraProvider } from '@penumbra-zone/client/global';
import {
  isPraxConnectionPortMessageEvent,
  isPraxRequestResponseMessageEvent,
  PraxMessage,
} from './message';
import { Prax } from '../message/prax';

import '@penumbra-zone/polyfills/Promise.withResolvers';

const requestMessage: PraxMessage<Prax.RequestConnection> = { [PRAX]: Prax.RequestConnection };

// this is just withResolvers, plus a sync-queryable state attribute
const connection = Object.assign(Promise.withResolvers<MessagePort>(), { state: false });
void connection.promise.then(
  () => (connection.state = true),
  () => (connection.state = false),
);

// this resolves the connection promise when the isolated port script indicates
const connectionListener = (msg: MessageEvent<unknown>) => {
  if (isPraxConnectionPortMessageEvent(msg) && msg.origin === window.origin) {
    // @ts-expect-error - ts can't understand the injected string
    connection.resolve(msg.data[PRAX] as MessagePort);
    window.removeEventListener('message', connectionListener);
  }
};
window.addEventListener('message', connectionListener);

const requestPromise = Promise.withResolvers();
requestPromise.promise.catch(() => connection.reject());

// Called to request a connection to the extension.
const postRequest = () => {
  console.log('postRequest');
  window.addEventListener('message', requestResponseHandler);
  window.postMessage(requestMessage, window.origin);
  return requestPromise.promise;
};

// declared outside of postRequest to prevent attaching multiple identical listeners
const requestResponseHandler = (msg: MessageEvent<unknown>) => {
  if (msg.origin === window.origin && isPraxRequestResponseMessageEvent(msg)) {
    console.log('requestResponseHandler');
    // @ts-expect-error - ts can't understand the injected string
    const attitude = msg.data[PRAX] as Prax.ApprovedConnection | Prax.DeniedConnection;
    if (attitude === Prax.ApprovedConnection) requestPromise.resolve();
    if (attitude === Prax.DeniedConnection) requestPromise.reject();
    window.removeEventListener('message', requestResponseHandler);
  }
};

// the actual object we attach to the global record, frozen
const praxProvider: PenumbraProvider = Object.freeze({
  manifest: `${PRAX_ORIGIN}/manifest.json`,
  connect: () => connection.promise,
  isConnected: () => connection.state,
  request: () => postRequest(),
});

// if the global isn't present, create it.
if (!window[PenumbraSymbol])
  Object.defineProperty(window, PenumbraSymbol, { value: new Object(), writable: false });

// reveal
Object.defineProperty(window[PenumbraSymbol], PRAX_ORIGIN, {
  value: praxProvider,
  writable: false,
  enumerable: true,
});
