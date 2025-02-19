import type { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import { ChannelLabel, parseConnectionName } from './channel-names.js';
import { CRSession } from './session.js';
import { assertMatchingSenders, isPortWithSenderOrigin } from './util/senders.js';

export interface ManagedPort {
  port: chrome.runtime.Port;
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

  private trackPort(port: chrome.runtime.Port, portAc = new AbortController()): ManagedPort {
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

  public async acceptSubChannel(
    name: string,
    expectedSender: chrome.runtime.MessageSender,
    subAc = new AbortController(),
  ): Promise<ManagedPort> {
    const unvalidatedPort = expectedSender.tab?.id
      ? chrome.tabs.connect(expectedSender.tab.id, { name })
      : chrome.runtime.connect({ name });

    const validPort = this.validateSessionPort(unvalidatedPort);
    assertMatchingSenders(expectedSender, (await validPort).sender);
    return this.trackPort(await validPort, subAc);
  }

  public async offerSubChannel(
    name: string,
    expectedSender: chrome.runtime.MessageSender,
    subAc = new AbortController(),
  ): Promise<ManagedPort> {
    const { promise: listenerPort, resolve, reject } = Promise.withResolvers<chrome.runtime.Port>();
    const listener = (port: chrome.runtime.Port) => {
      if (port.name === name) {
        resolve(port);
      }
    };
    chrome.runtime.onConnect.addListener(listener);
    AbortSignal.timeout(60_000).addEventListener('abort', () => reject());

    const unvalidatedPort = await listenerPort.finally(() =>
      chrome.runtime.onConnect.removeListener(listener),
    );

    const validPort = this.validateSessionPort(unvalidatedPort);
    assertMatchingSenders(expectedSender, (await validPort).sender);
    return this.trackPort(await validPort, subAc);
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
