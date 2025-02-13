import type { JsonValue } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import type { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import {
  isTransportAbort,
  isTransportEvent,
  isTransportMessage,
  TransportEvent,
  type TransportError,
  type TransportMessage,
  type TransportStream,
} from '@penumbra-zone/transport-dom/messages';
import { ChannelLabel, nameConnection, parseConnectionName } from './channel-names.js';
import { isTransportInitChannel, TransportInitChannel } from './message.js';
import { PortStreamSink, PortStreamSource } from './stream.js';

interface CRSession {
  abort: (reason?: unknown) => void;
  signal: AbortSignal;
  sessionId: string;
  port: chrome.runtime.Port;
  origin: string;
  requests: Map<string, AbortController>;
}

type SenderWithOrigin = chrome.runtime.MessageSender & { origin: string };
type PortWithOrigin = chrome.runtime.Port & { sender: SenderWithOrigin };
export type CheckPortSenderFn = (port: chrome.runtime.Port) => Promise<PortWithOrigin>;

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
  private sessions = new Map<string, CRSession>();

  /**
   * Create a new session manager to accept connections from `CRSessionClient`.
   *
   * @param managerId a string containing no spaces, matching the prefix used in your content script
   * @param checkPortSender a function used to validate the sender of a connection
   * @param handler your router entry function
   */
  constructor(
    private readonly managerId: string,
    private readonly checkPortSender: CheckPortSenderFn,
    private readonly handler: ChannelHandlerFn,
  ) {
    if (CRSessionManager.singleton) {
      throw new Error('Already constructed');
    }
    CRSessionManager.singleton = this;
    chrome.runtime.onConnect.addListener(this.transportConnection);
  }

  /**
   * Initialize the singleton session manager.
   *
   * @param managerId a string identifying this manager
   * @param checkPortSender function to assert validity of a sender
   * @param handler your router entry function
   */
  public static init = (
    managerId: string,
    checkPortSender: CheckPortSenderFn,
    handler: ChannelHandlerFn,
  ) => {
    CRSessionManager.singleton ??= new CRSessionManager(managerId, checkPortSender, handler);
    return CRSessionManager.singleton.sessions;
  };

  /**
   * Abort all sessions from a given origin presently active in this instance.
   *
   * @param targetOrigin the origin to kill
   */
  public killOrigin = (targetOrigin: string) => {
    console.debug('killOrigin', targetOrigin);
    this.sessions.forEach(session => {
      if (session.origin === targetOrigin) {
        session.requests.forEach(request => {
          if (!request.signal.aborted) {
            request.abort(
              new Error('Kill origin request', {
                cause: { targetOrigin },
              }),
            );
          }
        });
        if (!session.signal.aborted) {
          session.abort(new Error('Kill origin session', { cause: { targetOrigin } }));
          session.port.disconnect();
        }
      }
    });
  };

  /**
   * Abort all sessions from a given origin presently active in the singleton.
   *
   * @param targetOrigin the origin to kill
   */
  public static killOrigin = (targetOrigin: string) =>
    CRSessionManager.singleton?.killOrigin(targetOrigin);

  /**
   * This handler is called when a new connection is opened from any document
   * with access to the chrome runtime.
   *
   * Here we make an effort to identify these connections. If the name indicates
   * the connection is for this manager, a handler is connected to the port.
   */
  private transportConnection = (port: chrome.runtime.Port) => {
    // fast and simple name test
    if (!port.name.startsWith(this.managerId)) {
      return;
    }

    // parse the name
    const { label: channelLabel, uuid: sessionId } =
      parseConnectionName(this.managerId, port.name) ?? {};
    if (channelLabel !== ChannelLabel.TRANSPORT || !sessionId) {
      return;
    }

    // client is re-using a present session??
    if (this.sessions.has(sessionId)) {
      port.disconnect();
      throw new Error(`Session collision: ${sessionId}`);
    }

    // checking port sender is async
    void this.checkPortSender(port).then(
      okPort => {
        console.debug('Accepted connection', port.name);
        this.acceptSession(okPort, sessionId);
      },
      (e: unknown) => console.warn('Attempted connection was rejected', port.name, e),
    );
  };

  private acceptSession = (port: PortWithOrigin, sessionId: string) => {
    console.debug('acceptSession', port.name, sessionId);
    const senderOrigin = port.sender.origin;

    const ac = new AbortController();
    const session: CRSession = {
      abort: (r?: unknown) => ac.abort(r),
      signal: ac.signal,
      sessionId,
      origin: senderOrigin,
      port,
      requests: new Map(),
    };

    const sessionAbortListener = () => {
      console.debug('sessionAbortListener', sessionId);
      session.requests.forEach(request => request.abort(session.signal.reason));
      if (this.sessions.delete(sessionId)) {
        port.disconnect();
      }
    };

    const sessionDisconnectListener = () => {
      console.debug('sessionDisconnectListener', sessionId);
      if (this.sessions.delete(sessionId)) {
        session.abort(new Error('Session port disconnected'));
      }
    };

    const sessionMessageListener = (tev: unknown) => {
      console.debug('sessionMessageListener', tev);
      if (isTransportEvent(tev)) {
        void this.acceptRequest(session, tev);
      } else {
        console.warn('Unknown item in transport', tev);
      }
    };

    this.sessions.set(sessionId, session);

    session.signal.addEventListener('abort', sessionAbortListener);
    port.onDisconnect.addListener(sessionDisconnectListener);
    port.onMessage.addListener(sessionMessageListener);
    console.debug('acceptSession done', port.onMessage.hasListeners());
  };

  private acceptRequest = async (session: CRSession, tev: TransportEvent) => {
    console.debug('acceptRequest', session.port.name, tev);
    const { requestId } = tev;

    try {
      if (isTransportAbort(tev, requestId)) {
        session.requests
          .get(requestId)
          ?.abort(ConnectError.from('Client requested abort', Code.Canceled));
      } else if (session.requests.has(requestId)) {
        throw new ConnectError('Request collision', Code.Internal);
      } else {
        const ac = new AbortController();
        session.requests.set(requestId, ac);
        const response = await this.sessionRequestHandler(session, ac, tev);
        console.debug('acceptRequest response', response);
        session.port.postMessage(response);
      }
    } catch (cause) {
      console.debug('acceptRequest error', cause);
      session.port.postMessage({
        requestId,
        error: errorToJson(ConnectError.from(cause), undefined),
      });
    } finally {
      session.requests.delete(requestId);
    }
  };

  /**
   * This method enters the router, and returns a response.
   *
   * It expects a single message, so only supports unary requests and
   * server-streaming requests. This should *always successfully return* a
   * `TransportEvent`, containing json representing a response or json
   * representing an error.
   */
  private sessionRequestHandler = async (
    session: CRSession,
    ac: AbortController,
    tev: TransportEvent,
  ): Promise<TransportMessage | TransportInitChannel | TransportError> => {
    console.debug('sessionRequestHandler', tev);
    const { requestId } = tev;

    try {
      let request: JsonValue | ReadableStream<JsonValue>;
      if (isTransportMessage(tev, requestId)) {
        request = tev.message;
      } else if (isTransportInitChannel(tev)) {
        request = await this.requestChannelStream(session.port.sender?.tab?.id, tev.channel);
      } else {
        console.debug('sessionRequestHandler unknown request kind', requestId, tev);
        throw new ConnectError('Unknown request kind', Code.Unimplemented);
      }

      const response = await this.handler(request, ac.signal);
      if (response instanceof ReadableStream) {
        console.debug('sessionRequestHandler response stream', requestId, response);
        return { requestId, channel: this.responseChannelStream(response) };
      } else {
        console.debug('sessionRequestHandler response message', requestId, response);
        return { requestId, message: response };
      }
    } catch (error: unknown) {
      console.debug('sessionRequestHandler response error', requestId, error);
      return { requestId, error: errorToJson(ConnectError.from(error), undefined) };
    } finally {
      session.requests.delete(requestId);
    }
  };

  /**
   * Streams are not jsonifiable, so this function sinks a response stream
   * into a dedicated chrome runtime channel, for reconstruction by the
   * client.
   *
   * A jsonifiable message identifying a unique connection name is returned
   * and should be transported to the client.  The client should open a
   * connection bearing this name to source the stream.
   */
  private responseChannelStream = (
    stream: TransportStream['stream'],
  ): TransportInitChannel['channel'] => {
    const channel = nameConnection(this.managerId, ChannelLabel.STREAM);
    console.debug('responseChannelStream', channel);
    const sinkListener = (sinkPort: chrome.runtime.Port) => {
      if (sinkPort.name === channel) {
        chrome.runtime.onConnect.removeListener(sinkListener);
        void this.checkPortSender(sinkPort)
          .then(() =>
            stream
              .pipeTo(new WritableStream(new PortStreamSink(sinkPort)))
              .catch((e: unknown) => console.debug('responseChannelStream error', e)),
          )
          .finally(() => sinkPort.disconnect());
      }
    };

    AbortSignal.any([AbortSignal.timeout(10_000)]).addEventListener('abort', () =>
      chrome.runtime.onConnect.removeListener(sinkListener),
    );

    chrome.runtime.onConnect.addListener(sinkListener);

    return channel;
  };

  private requestChannelStream = async (
    tabId: number | undefined,
    channel: TransportInitChannel['channel'],
  ): Promise<TransportStream['stream']> => {
    console.debug('requestChannelStream', channel);
    if (!globalThis.__DEV__) {
      throw new ConnectError('Unknown request kind', Code.Unimplemented);
    }

    const streamPort = tabId
      ? chrome.tabs.connect(tabId, { name: channel })
      : chrome.runtime.connect({ name: channel });

    return new ReadableStream(new PortStreamSource(await this.checkPortSender(streamPort)));
  };
}
