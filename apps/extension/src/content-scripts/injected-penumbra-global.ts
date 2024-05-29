/**
 * This file is injected by the extension as a content script, to create the
 * mainworld global that allows pages to detect installed providers and connect
 * to them.
 *
 * The global is identified by `Symbol.for('penumbra')` and consists of a record
 * with string keys referring to `PenumbraInjection` objects that contain a
 * simple API. The identifiers on this record should be unique, and correspond
 * to a browser extension id. Providers should provide a link to their extension
 * manifest in their record entry.
 *
 * The global is frozen to discourage mutation, but you should consider that the
 * global and everything on it is only as trustable as the scripts running on
 * the page. Imports, requires, includes, script tags, packages your webapp
 * depends on, userscripts, or other extensions' content scripts could all
 * mutate or preempt this, and all have the power to interfere or intercept
 * connections.
 */

import { PenumbraInjection, PenumbraRequestFailure, PenumbraSymbol } from '@penumbra-zone/client';

import {
  isPraxFailureMessageEvent,
  isPraxPortMessageEvent,
  PraxMessage,
  unwrapPraxMessage,
} from './message-event';

import { PraxConnection } from '../message/prax';

type PromiseSettledResultStatus = PromiseSettledResult<unknown>['status'];

class PraxInjection {
  private static singleton?: PraxInjection = new PraxInjection();

  public static get penumbra() {
    return PraxInjection.singleton!.injection;
  }

  private manifestUrl = `${PRAX_ORIGIN}/manifest.json`;
  private _request = Promise.withResolvers<void>();
  private _connect = Promise.withResolvers<MessagePort>();
  private _disconnect = Promise.withResolvers<void>();

  private connectState?: PromiseSettledResultStatus;
  private requestState?: PromiseSettledResultStatus;
  private disconnectState?: PromiseSettledResultStatus;

  private injection: Readonly<PenumbraInjection> = Object.freeze({
    disconnect: () => this.endConnection(),
    connect: () => (this.state() !== false ? this._connect.promise : this.connectionFailure),
    isConnected: () => this.state(),
    request: () => this.postRequest(),
    manifest: String(this.manifestUrl),
  });

  private constructor() {
    if (PraxInjection.singleton) return PraxInjection.singleton;

    window.addEventListener('message', this.connectionListener);

    void this._connect.promise
      .then(
        () => (this.connectState ??= 'fulfilled'),
        () => (this.connectState ??= 'rejected'),
      )
      .finally(() => window.removeEventListener('message', this.connectionListener));

    void this._disconnect.promise.then(
      () => (this.disconnectState = 'fulfilled'),
      () => (this.disconnectState = 'rejected'),
    );

    void this._request.promise.then(
      () => (this.requestState = 'fulfilled'),
      () => (this.requestState = 'rejected'),
    );
  }

  private state(): boolean | undefined {
    if (this.disconnectState) return false;
    if (this.requestState === 'rejected') return false;
    return this.connectState && this.connectState === 'fulfilled';
  }

  // this listener will resolve the connection promise AND request promise when
  // the isolated content script injected-connection-port sends a `MessagePort`
  private connectionListener = (msg: MessageEvent<unknown>) => {
    if (msg.origin === window.origin && isPraxPortMessageEvent(msg)) {
      const praxPort = unwrapPraxMessage(msg);
      if (praxPort instanceof MessagePort) {
        this._connect.resolve(praxPort);
        this._request.resolve();
      }
    }
  };

  // this listener only rejects the request promise. success of the request
  // promise is indicated by the connection promise being resolved.
  private requestFailureListener = (msg: MessageEvent<unknown>) => {
    if (msg.origin === window.origin && isPraxFailureMessageEvent(msg)) {
      const status = unwrapPraxMessage(msg);
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
      this._request.reject(failure);
    }
  };

  // always reject with the most important reason at time of access
  // 1. disconnect
  // 2. connection failure
  // 3. request
  private get connectionFailure() {
    // Promise.race checks in order of the list index. so if more than one
    // promise is settled, Promise.race responds with the earlier index
    return Promise.race([
      // rejects with disconnect success, rejects with disconnect failure
      this._disconnect.promise.then(() => Promise.reject(Error('Disconnected'))),
      // ignores connection success, rejects with connection failure
      this._connect.promise.then(() => new Promise<never>(() => null)),
      // rejects with previous success, rejects with previous failure
      this._request.promise.then(() => Promise.reject(Error('Disconnected'))),
      // this should be unreachable
      Promise.reject(Error('Unknown failure')),
    ]);
  }

  private postRequest() {
    const state = this.state();
    if (state === true)
      // connection is already active
      this._request.resolve();
    else if (state === false) {
      // connection is already failed
      const failure = this.connectionFailure;
      failure.catch((u: unknown) => this._request.reject(u));
      // a previous request may have succeeded, so return the failure directly
      return failure;
    } else {
      // no request made yet. attach listener and emit
      window.addEventListener('message', this.requestFailureListener);
      void this._request.promise.finally(() =>
        window.removeEventListener('message', this.requestFailureListener),
      );
      window.postMessage(
        {
          [PRAX]: PraxConnection.Request,
        } satisfies PraxMessage<PraxConnection.Request>,
        window.origin,
      );
    }

    return this._request.promise;
  }

  private endConnection() {
    // attempt actual disconnect
    void this._connect.promise
      .then(
        port => {
          port.postMessage(false);
          port.close();
        },
        (e: unknown) => console.warn('Could not attempt disconnect', e),
      )
      .catch((e: unknown) => console.error('Disconnect failed', e));
    window.postMessage(
      { [PRAX]: PraxConnection.End } satisfies PraxMessage<PraxConnection.End>,
      '/',
    );

    // resolve the promise by state
    const state = this.state();
    if (state === true) this._disconnect.resolve();
    else if (state === false) this._disconnect.reject(Error('Connection already inactive'));
    else this._disconnect.reject(Error('Connection not yet active'));

    return this._disconnect.promise;
  }
}

// if the global isn't present, create it.
if (!window[PenumbraSymbol])
  Object.defineProperty(window, PenumbraSymbol, { value: {}, writable: false });

// reveal
Object.defineProperty(window[PenumbraSymbol], PRAX_ORIGIN, {
  value: PraxInjection.penumbra,
  writable: false,
  enumerable: true,
});
