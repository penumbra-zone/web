import type { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import { ChannelLabel, parseConnectionName } from './channel-names.js';
import { CRSession } from './session.js';
import { PortStreamSink } from './stream/sink.js';
import { PortStreamSource } from './stream/source.js';
import {
  assertMatchingSenders,
  assertPortWithSenderOrigin,
  isPortWithSenderOrigin,
} from './util/senders.js';

export interface ManagedPort {
  port: chrome.runtime.Port & { sender: { origin: string } };
  portAc: AbortController;
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

  private ports = new Map<chrome.runtime.Port, AbortController>();
  private sessions = new Map<string, CRSession>();
  private constructor(
    public readonly managerId: string,
    public readonly handler: ChannelHandlerFn,
    public readonly validateSessionPort: ValidateSessionPortFn,
  ) {
    CRSessionManager.assertUninitialized();
    CRSessionManager.singleton = this;
    chrome.runtime.onConnect.addListener(this.transportConnection);

    if (globalThis.__DEV__) {
      console.debug('CRSessionManager sessions', this.sessions);
    }
  }

  /**
   * This handler is called when a new connection is opened from any document
   * with access to the chrome runtime.
   *
   * Here we make an effort to identify these connections. If the name indicates
   * the connection is for this manager, handlers are connected to the port.
   */
  private transportConnection = (unvalidatedPort: chrome.runtime.Port) => {
    if (
      // quick check for a name indicating this manager
      unvalidatedPort.name.startsWith(this.managerId) &&
      // require an origin
      isPortWithSenderOrigin(unvalidatedPort)
    ) {
      // parse the name
      const { label: channelLabel, uuid: sessionId } =
        parseConnectionName(this.managerId, unvalidatedPort.name) ?? {};
      if (channelLabel === ChannelLabel.TRANSPORT && sessionId) {
        if (this.sessions.has(sessionId)) {
          // client is re-using a present session??
          // don't disconnect the port, just leave it hanging
          throw new Error(`Session collision: ${sessionId}`);
        }

        // create a new session
        const session = new CRSession(
          this,
          this.trackPort(unvalidatedPort),
          this.validateSessionPort(unvalidatedPort),
        );
        this.sessions.set(sessionId, session);
        session.signal.addEventListener('abort', () => this.sessions.delete(sessionId));
      }
    }
  };

  /**
   * Kill all connections with a given origin.
   *
   * @param targetOrigin the origin to kill
   */
  public static killOrigin(targetOrigin: string) {
    for (const [port, ac] of CRSessionManager.assertInitialized().ports.entries()) {
      if (port.sender?.origin === targetOrigin) {
        ac.abort();
      }
    }
  }

  private trackPort(
    port: chrome.runtime.Port & { sender: { origin: string } },
    portAc = new AbortController(),
  ): ManagedPort {
    if (this.ports.has(port)) {
      throw new Error('Port already tracked');
    } else {
      port.onDisconnect.addListener(() => {
        if (this.ports.delete(port)) {
          portAc.abort();
        }
      });

      portAc.signal.addEventListener('abort', () => {
        if (this.ports.delete(port)) {
          port.disconnect();
        }
      });

      this.ports.set(port, portAc);

      portAc.signal.throwIfAborted();
      return { port, portAc };
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
  public async acceptSubChannel(
    name: string,
    expectedSender: chrome.runtime.MessageSender,
    subAc = new AbortController(),
  ): Promise<PortStreamSource> {
    const unvalidatedPort = expectedSender.tab?.id
      ? chrome.tabs.connect(expectedSender.tab.id, { name })
      : chrome.runtime.connect({ name });

    assertMatchingSenders(expectedSender, unvalidatedPort.sender);
    const unvalidatedSource = new PortStreamSource(unvalidatedPort);

    const validSource = this.validateSessionPort(unvalidatedPort).then(
      validPort => {
        this.trackPort(assertPortWithSenderOrigin(validPort), subAc);
        return unvalidatedSource; // now valid
      },
      (cause: unknown) => {
        console.debug('invalid source', cause);
        unvalidatedPort.disconnect();
        unvalidatedSource.cancel(cause);
        throw cause;
      },
    );

    return validSource;
  }

  /**
   * Wrapped `chrome.runtime.onConnect` for sessions to offer stream
   * sub-channels, for outgoing streaming responses.
   *
   * The caller must independently convey the channel name.
   *
   * @param name the name of the sub-channel
   * @param expectedSender the expected sender of the connection
   * @param subAc optional pre-existing abort controller
   * @returns a `PortStreamSink` to a validated sender
   */
  public async offerSubChannel(
    name: string,
    expectedSender: chrome.runtime.MessageSender,
    subAc = new AbortController(),
  ): Promise<PortStreamSink> {
    const { promise: validSink, ...validation } = Promise.withResolvers<PortStreamSink>();

    const sinkListener = (unvalidatedPort: chrome.runtime.Port) => {
      // expect a port with the given channel name
      if (unvalidatedPort.name === name) {
        chrome.runtime.onConnect.removeListener(sinkListener);
        assertMatchingSenders(expectedSender, unvalidatedPort.sender);
        const unvalidatedSink = new PortStreamSink(unvalidatedPort);
        this.validateSessionPort(unvalidatedPort).then(
          validPort => {
            this.trackPort(assertPortWithSenderOrigin(validPort), subAc);
            validation.resolve(unvalidatedSink);
          },
          cause => {
            if (globalThis.__DEV__) {
              console.debug('offerSubChannel invalid port', unvalidatedPort.name, cause);
            }
            unvalidatedPort.disconnect();
            validation.reject(cause);
          },
        );
      }
    };

    chrome.runtime.onConnect.addListener(sinkListener);

    return validSink;
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
