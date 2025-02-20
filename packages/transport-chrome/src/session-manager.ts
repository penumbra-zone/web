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
import { captureDisconnectedPortError } from './util/capture-error.js';

interface CRSession {
  abort: (reason?: unknown) => void;
  signal: AbortSignal;
  sessionId: string;
  verifiedPort: Promise<chrome.runtime.Port>;
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
   * @param handler your router entry function
   * @param checkPortSender a function used to validate the sender of a connection
   */
  constructor(
    private readonly managerId: string,
    private readonly handler: ChannelHandlerFn,
    private readonly checkPortSender: CheckPortSenderFn,
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
   * @param handler your router entry function
   * @param checkPortSender function to assert validity of a sender
   */
  public static init = (
    managerId: string,
    handler: ChannelHandlerFn,
    checkPortSender: CheckPortSenderFn,
  ) => {
    CRSessionManager.singleton ??= new CRSessionManager(managerId, handler, checkPortSender);
    return CRSessionManager.singleton.sessions;
  };

  /**
   * Abort all sessions from a given origin presently active in the singleton.
   *
   * @param targetOrigin the origin to kill
   */
  public static killOrigin = (targetOrigin: string) => {
    if (CRSessionManager.singleton) {
      CRSessionManager.singleton.sessions.forEach(session => {
        if (session.origin === targetOrigin) {
          session.requests.forEach(request => {
            if (!request.signal.aborted) {
              request.abort();
            }
          });
          if (!session.signal.aborted) {
            session.abort();
          }
        }
      });
    } else {
      throw new Error('No session manager');
    }
  };

  /**
   * This handler is called when a new connection is opened from any document
   * with access to the chrome runtime.
   *
   * Here we make an effort to identify these connections. If the name indicates
   * the connection is for this manager, a handler is connected to the port.
   */
  private transportConnection = (unverifiedPort: chrome.runtime.Port) => {
    // require an identified origin
    if (!unverifiedPort.sender?.origin) {
      return;
    }

    // fast and simple name test
    if (!unverifiedPort.name.startsWith(this.managerId)) {
      return;
    }

    // parse the name
    const { label: channelLabel, uuid: clientId } =
      parseConnectionName(this.managerId, unverifiedPort.name) ?? {};
    if (channelLabel !== ChannelLabel.TRANSPORT || !clientId) {
      return;
    }

    // client is re-using a present session??
    if (this.sessions.has(clientId)) {
      unverifiedPort.disconnect();
      throw new Error(`Session collision: ${clientId}`);
    }

    // checking port sender is async, but listeners must attach immediately
    this.acceptSession(unverifiedPort, this.checkPortSender(unverifiedPort), clientId);
  };

  private acceptSession = (
    unverifiedPort: chrome.runtime.Port,
    verifiedPort: Promise<chrome.runtime.Port>,
    sessionId: string,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- checked above
    const senderOrigin = unverifiedPort.sender!.origin!;

    const ac = new AbortController();
    const session: CRSession = {
      abort: (r?: unknown) => ac.abort(r),
      signal: ac.signal,
      sessionId,
      origin: senderOrigin,
      verifiedPort,
      requests: new Map(),
    };

    const sessionAbortListener = () => {
      session.requests.forEach(request => request.abort(session.signal.reason));
      if (this.sessions.delete(sessionId)) {
        unverifiedPort.disconnect();
      }
    };

    const sessionDisconnectListener = () => {
      if (this.sessions.delete(sessionId)) {
        session.abort();
      }
    };

    const sessionMessageListener = (tev: unknown) =>
      void verifiedPort.then(() => {
        if (isTransportEvent(tev)) {
          void this.acceptRequest(session, tev);
        } else {
          console.warn('Unknown item in transport', tev);
        }
      });

    this.sessions.set(sessionId, session);

    session.signal.addEventListener('abort', sessionAbortListener);
    unverifiedPort.onDisconnect.addListener(sessionDisconnectListener);
    unverifiedPort.onMessage.addListener(sessionMessageListener);
  };

  private postResponse = (session: CRSession, response: TransportMessage | TransportInitChannel) =>
    void session.verifiedPort
      .then(port => {
        port.postMessage(response);
      })
      .catch(captureDisconnectedPortError);

  private postFailure = (session: CRSession, failure: TransportError<string | undefined>) =>
    void session.verifiedPort
      .then(port => {
        port.postMessage(failure);
      })
      .catch(captureDisconnectedPortError);

  private acceptRequest = async (session: CRSession, tev: TransportEvent) => {
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
        if ('error' in response) {
          this.postFailure(session, response);
        } else {
          this.postResponse(session, response);
        }
      }
    } catch (cause) {
      this.postFailure(session, {
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
  ): Promise<TransportMessage | TransportInitChannel | TransportError<string>> => {
    const { requestId } = tev;

    let request: JsonValue | ReadableStream<JsonValue>;
    if (isTransportMessage(tev, requestId)) {
      request = tev.message;
    } else if (isTransportInitChannel(tev) && globalThis.__DEV__) {
      const tabId = (await session.verifiedPort).sender?.tab?.id;
      request = await this.acceptChannelStreamRequest(tabId, tev.channel);
    } else {
      throw new ConnectError('Unknown request kind', Code.Unimplemented);
    }

    const response = await this.handler(request, AbortSignal.any([session.signal, ac.signal]));
    if (response instanceof ReadableStream) {
      return { requestId, channel: this.makeChannelStreamResponse(response) };
    } else {
      return { requestId, message: response };
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
  private makeChannelStreamResponse = (
    stream: TransportStream['stream'],
  ): TransportInitChannel['channel'] => {
    const channel = nameConnection(this.managerId, ChannelLabel.STREAM);
    const sinkListener = (sinkPort: chrome.runtime.Port) => {
      if (sinkPort.name === channel) {
        chrome.runtime.onConnect.removeListener(sinkListener);
        stream
          .pipeTo(new WritableStream(new PortStreamSink(sinkPort)))
          .catch((e: unknown) => console.debug('session-manager makeChannelStreamResponse', e))
          .finally(() => sinkPort.disconnect());
      }
    };

    AbortSignal.timeout(10_000).addEventListener('abort', () =>
      chrome.runtime.onConnect.removeListener(sinkListener),
    );

    chrome.runtime.onConnect.addListener(sinkListener);

    return channel;
  };

  private acceptChannelStreamRequest = (
    tabId: number | undefined,
    channel: TransportInitChannel['channel'],
  ): Promise<TransportStream['stream']> => {
    const streamPort = tabId
      ? chrome.tabs.connect(tabId, { name: channel })
      : chrome.runtime.connect({ name: channel });
    const validPort = this.checkPortSender(streamPort);
    const stream = new ReadableStream(new PortStreamSource(streamPort));
    validPort.catch(() => stream.cancel());
    return validPort.then(() => stream);
  };
}
