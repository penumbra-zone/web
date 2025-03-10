import type { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import { ChannelLabel, parseConnectionId } from './channel-names.js';
import { CRSession } from './session.js';
import { PortStreamSink } from './stream/sink.js';
import { PortStreamSource } from './stream/source.js';
import {
  assertMatchingSenders,
  assertPortWithSenderOrigin,
  isPortWithSenderOrigin,
} from './util/senders.js';
import { JsonValue } from '@bufbuild/protobuf';

export interface ManagedPort {
  abort: AbortController['abort'];
  signal: AbortSignal;
  unvalid: chrome.runtime.Port & { sender: { origin: string } };
  valid: Promise<chrome.runtime.Port>;
}

export type ValidateSessionPortFn = (port: chrome.runtime.Port) => Promise<chrome.runtime.Port>;

/**
 * Only for use as an extension-level singleton by the extension's main
 * background worker.
 *
 * The extension might want to revoke permission of an origin, and kill all of
 * that origin's connections immediately. It's simplest to provide a revoke
 * method on the static class.
 *
 * Connection approval is provided by an async callback, which is used to
 * validate each new port's sender. Message listeners are attached before async
 * execution, so incoming requests are not dropped. Handling should only execute
 * if approval resolves succesfully.
 *
 * Currently this supports
 * - connections from content scripts (dapp pages)
 * - connections from internal extension pages
 * - connections from internal extension workers
 *
 * This does not support
 * - connections from this same worker back to itself
 *
 * If you are connecting from the same worker in which you init this manager,
 * you cannot construct a session client capable of connecting to this manager.
 * The `createDirectClient` export of `@penumbra-zone/transport-dom/direct` is
 * more suitable.
 *
 * In the future we may want to support
 * - connections directly from dapp pages
 * - connections from native applications
 * - connections from other extensions
 */

export class CRSessionManager {
  private static singleton?: CRSessionManager;

  /**
   * Initialize the singleton session manager, or return the existing singleton.
   *
   * @param managerId a string identifying this manager
   * @param handler your router entry function
   * @param validateSessionPort callback to assert validity of a connection
   */
  public static init = (
    managerId: string,
    handler: ChannelHandlerFn,
    validateSessionPort: ValidateSessionPortFn,
  ): ReadonlyMap<string, CRSession> => {
    CRSessionManager.singleton ??= new CRSessionManager(managerId, handler, validateSessionPort);
    if (
      CRSessionManager.singleton.managerId !== managerId ||
      CRSessionManager.singleton.handler !== handler ||
      CRSessionManager.singleton.validateSessionPort !== validateSessionPort
    ) {
      throw new Error("Init parameters don't match singleton parameters");
    }

    return CRSessionManager.singleton.sessions;
  };

  private ports = new Map<string, ManagedPort>();
  private sessions = new Map<string, CRSession>();
  private constructor(
    public readonly managerId: string,
    public readonly handler: ChannelHandlerFn,
    public readonly validateSessionPort: ValidateSessionPortFn,
  ) {
    CRSessionManager.assertUninitialized();
    CRSessionManager.singleton = this;
    chrome.runtime.onConnect.addListener(this.onConnect);

    if (globalThis.__DEV__) {
      console.debug('CRSessionManager', this);
    }
  }

  /**
   * This handler is called when a new connection is opened from any document
   * with access to the chrome runtime.
   *
   * Here we make an effort to identify these connections. If the name indicates
   * the connection is for this manager, handlers are connected to the port.
   */
  private onConnect = (attempt: chrome.runtime.Port) => {
    const sessionId =
      isPortWithSenderOrigin(attempt) &&
      parseConnectionId(ChannelLabel.TRANSPORT, this.managerId, attempt.name);

    if (sessionId) {
      if (this.sessions.has(sessionId)) {
        // client is re-using a present session??
        // don't disconnect the port, just leave it hanging
        throw new Error(`Session collision: ${sessionId}`, {
          cause: { sessionId, attempt, existing: this.sessions.get(sessionId) },
        });
      }

      try {
        // create a new session
        const session = new CRSession(this, this.trackPort(attempt));
        this.sessions.set(sessionId, session);
        session.signal.addEventListener('abort', () => this.sessions.delete(sessionId));
      } catch (e) {
        if (globalThis.__DEV__) {
          console.debug('Session init failed', e);
        }
        attempt.disconnect();
      }
    }
  };

  /**
   * Kill all connections with a given origin. Returns the collection of senders
   * associated with the killed sessions, for further cleanup.
   *
   * @param targetOrigin the origin to kill
   */
  public static killOrigin(targetOrigin: string) {
    const killed = new Set<chrome.runtime.MessageSender>();

    // kill sessions
    for (const session of CRSessionManager.assertInitialized().sessions.values()) {
      if (session.sender.origin === targetOrigin) {
        session.abort();
        killed.add(session.sender);
      }
    }

    // kill lingering subchannels
    for (const port of CRSessionManager.assertInitialized().ports.values()) {
      if (port.unvalid.sender.origin === targetOrigin) {
        console.warn('subchannel not killed by session', port.unvalid.name);
        port.abort();
        killed.add(port.unvalid.sender);
      }
    }

    return killed;
  }

  private trackPort(port: chrome.runtime.Port, ac = new AbortController()): ManagedPort {
    if (globalThis.__DEV__) {
      console.debug('trackPort', port.name);
    }

    try {
      ac.signal.throwIfAborted();

      if (this.ports.has(port.name)) {
        throw new Error('Port already tracked', { cause: port.name });
      }

      port.onDisconnect.addListener(() => {
        if (globalThis.__DEV__) {
          console.debug('trackPort onDisconnect', port.name);
        }
        if (this.ports.delete(port.name)) {
          if (globalThis.__DEV__) {
            console.debug('trackPort onDisconnect aborting', port.name);
          }
          ac.abort();
        }
      });

      ac.signal.addEventListener('abort', () => {
        if (globalThis.__DEV__) {
          console.debug('trackPort signal', port.name);
        }
        if (this.ports.delete(port.name)) {
          if (globalThis.__DEV__) {
            console.debug('trackPort signal disconnecting', port.name);
          }
          port.disconnect();
        }
      });

      const managedPort: ManagedPort = {
        abort: (r: unknown) => ac.abort(r),
        signal: ac.signal,
        unvalid: assertPortWithSenderOrigin(port),
        valid: this.validateSessionPort(port),
      };

      this.ports.set(port.name, managedPort);
      return managedPort;
    } catch (e) {
      if (globalThis.__DEV__) {
        console.debug('trackPort failed', port.name, e);
      }
      this.ports.delete(port.name);
      port.disconnect();
      ac.abort(e);
      throw e;
    }
  }

  /**
   * Wrapped `chrome.runtime.connect` for sessions to accept stream
   * sub-channels, for incoming streaming requests.
   *
   * @param name the name of the sub-channel
   * @param expectedSender the expected sender of the connection
   * @param subAc the abort controller for the sub-channel
   * @returns a `PortStreamSource` from a validated sender
   */
  public acceptSubChannel(
    name: string,
    expectedSender: chrome.runtime.MessageSender,
    requestAc = new AbortController(),
  ): Promise<ReadableStream<JsonValue>> {
    const {
      promise: validStream,
      resolve,
      reject,
    } = Promise.withResolvers<ReadableStream<JsonValue>>();

    requestAc.signal.addEventListener('abort', () => reject(requestAc.signal.reason));

    // open a port with the given channel name
    const attempt = expectedSender.tab?.id
      ? chrome.tabs.connect(expectedSender.tab.id, { name })
      : chrome.runtime.connect({ name });

    try {
      assertMatchingSenders(expectedSender, attempt.sender);
      const port = this.trackPort(attempt);
      const stream = new ReadableStream(new PortStreamSource(port.unvalid));
      void port.valid.then(() => resolve(stream), reject);
    } catch (e) {
      reject(e);
    }

    return validStream;
  }

  /**
   * Wrapped `chrome.runtime.onConnect` for sessions to offer stream
   * sub-channels, for outgoing streaming responses.
   *
   * The caller must independently convey the channel name.
   *
   * @param name the name of the sub-channel
   * @param expectedSender the expected sender of the connection
   * @param requestAc optional pre-existing abort controller
   * @returns a `PortStreamSink` to a validated sender
   */
  public offerSubChannel(
    name: string,
    expectedSender: chrome.runtime.MessageSender,
    requestAc = new AbortController(),
  ): Promise<WritableStream<JsonValue>> {
    const {
      promise: validStream,
      resolve,
      reject,
    } = Promise.withResolvers<WritableStream<JsonValue>>();

    requestAc.signal.addEventListener('abort', () => reject(requestAc.signal.reason));

    void validStream.finally(() => chrome.runtime.onConnect.removeListener(sinkListener));
    const sinkListener = (attempt: chrome.runtime.Port) => {
      // listen for a port with the given channel name
      if (attempt.name === name) {
        chrome.runtime.onConnect.removeListener(sinkListener);

        try {
          assertMatchingSenders(expectedSender, attempt.sender);
          const port = this.trackPort(attempt);
          const stream = new WritableStream(new PortStreamSink(port.unvalid));
          void port.valid.then(() => resolve(stream), reject);
        } catch (e) {
          reject(e);
        }
      }
    };
    chrome.runtime.onConnect.addListener(sinkListener);

    return validStream;
  }

  private static assertInitialized = () => {
    if (!CRSessionManager.singleton) {
      throw new Error('Not initialized');
    }
    return CRSessionManager.singleton;
  };

  private static assertUninitialized = () => {
    if (CRSessionManager.singleton) {
      throw new Error('Already initialized');
    }
  };
}
