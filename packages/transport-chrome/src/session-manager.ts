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
 * Currently this supports
 * - connections from content scripts (and thus webpages)
 * - connections from pages in this extension
 * - connections from workers in this extension
 *
 * This does not support
 * - connections from a script back to itself
 *
 * In the future we may want to support
 * - connections directly from webpages
 * - connections from native applications
 * - connections from other extensions
 *
 * If you are connecting from the same worker running this script (currently,
 * service-to-service communication) you cannot make a `chrome.runtime.connect`
 * call that activates this manager, and you should use normal DOM messaging to
 * enter your router.
 */

export class CRSessionManager {
  private static singleton?: CRSessionManager;

  private static assertInitialized() {
    if (!CRSessionManager.singleton) {
      throw new Error('Not initialized');
    }
    return CRSessionManager.singleton;
  }

  private static assertUninitialized() {
    if (CRSessionManager.singleton) {
      throw new Error('Already initialized');
    }
  }

  private sessions = new Map<string, CRSession>();
  private ports = new Map<chrome.runtime.Port, AbortController>();

  private constructor(
    public readonly managerId: string,
    public readonly handler: ChannelHandlerFn,
    public readonly validateSessionPort: ValidateSessionPortFn,
  ) {
    CRSessionManager.assertUninitialized();
    CRSessionManager.singleton = this;
    chrome.runtime.onConnect.addListener(this.initSession);
  }

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

  /**
   * This handler is called when a new connection is opened from any document
   * with access to the chrome runtime.
   *
   * Here we make an effort to identify these connections. If the name indicates
   * the connection is for this manager, handlers are connected to the port.
   */
  private initSession = (sessionPort: chrome.runtime.Port) => {
    if (
      // quick check for a name indicating this manager
      sessionPort.name.startsWith(this.managerId) &&
      // require an origin
      isPortWithSenderOrigin(sessionPort)
    ) {
      // parse the name thoroughly
      const { label: channelLabel, uuid: sessionId } =
        parseConnectionName(this.managerId, sessionPort.name) ?? {};
      if (channelLabel === ChannelLabel.TRANSPORT && sessionId) {
        // client is re-using a present session??
        if (this.sessions.has(sessionId)) {
          // don't disconnect the port, just leave it hanging
          throw new Error(`Session collision: ${sessionId}`);
        }

        // create a new session
        const session = new CRSession(this, this.trackPort(sessionPort));
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
      return { port, portAc };
    }
  }

  public async acceptSubChannel(
    name: string,
    expectedSender: chrome.runtime.MessageSender,
    subAc?: AbortController,
  ): Promise<ManagedPort> {
    const unvalidatedPort = expectedSender.tab?.id
      ? chrome.tabs.connect(expectedSender.tab.id, { name })
      : chrome.runtime.connect({ name });

    assertMatchingSenders(expectedSender, unvalidatedPort.sender);
    const validPort = this.validateSessionPort(unvalidatedPort);

    return this.trackPort(await validPort, subAc);
  }

  public async offerSubChannel(
    name: string,
    expectedSender: chrome.runtime.MessageSender,
    subAc?: AbortController,
  ): Promise<ManagedPort> {
    const { promise: validPort, resolve, reject } = Promise.withResolvers<chrome.runtime.Port>();

    const wrappedListener = (unvalidatedPort: chrome.runtime.Port) => {
      if (unvalidatedPort.name === name) {
        chrome.runtime.onConnect.removeListener(wrappedListener);
        void (async () => {
          try {
            assertMatchingSenders(expectedSender, unvalidatedPort.sender);
            resolve(await this.validateSessionPort(unvalidatedPort));
          } catch (e: unknown) {
            console.warn('Subchannel init failed', unvalidatedPort.name, e);
            reject(e);
          }
        })();
      }
    };
    chrome.runtime.onConnect.addListener(wrappedListener);

    return this.trackPort(await validPort, subAc);
  }
}
