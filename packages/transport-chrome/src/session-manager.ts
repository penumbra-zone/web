import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { ChannelLabel, nameConnection, parseConnectionName } from './channel-names.js';
import { TransportInitChannel } from './message.js';
import { PortStreamSink } from './stream.js';
import { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import {
  isTransportAbort,
  isTransportMessage,
  TransportError,
  TransportMessage,
  TransportStream,
} from '@penumbra-zone/transport-dom/messages';

interface CRSession {
  abort: AbortController['abort'];
  signal: AbortSignal;
  sessionId: string;
  verifiedPort: ReturnType<ValidateSenderFn>;
  sender: chrome.runtime.MessageSender;
  origin: string;
  requests: Map<string, AbortController>;
}

type PortWithSenderOrigin = chrome.runtime.Port & {
  sender: chrome.runtime.MessageSender & { origin: string };
};

const isPortWithSenderOrigin = (p?: chrome.runtime.Port): p is PortWithSenderOrigin =>
  Boolean(p?.sender?.origin);

export type ValidateSenderFn = (port: chrome.runtime.Port) => Promise<PortWithSenderOrigin>;

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
   * @param prefix a string containing no spaces, matching the prefix used in your content script
   * @param handler your router entry function
   * @param validateSender a function used to validate the sender of a connection
   */
  private constructor(
    private readonly prefix: string,
    private readonly handler: ChannelHandlerFn,
    private readonly validateSender: ValidateSenderFn,
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
   * @param validateSender function to assert validity of a sender
   */
  public static init = (
    managerId: string,
    handler: ChannelHandlerFn,
    validateSender: ValidateSenderFn,
  ) => {
    CRSessionManager.singleton ??= new CRSessionManager(managerId, handler, validateSender);
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
          session.abort();
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
  private transportConnection = (port: chrome.runtime.Port) => {
    // require an identified origin
    if (!isPortWithSenderOrigin(port)) {
      return;
    }

    // fast and simple name test
    if (!port.name.startsWith(this.prefix)) {
      return;
    }

    // parse the name
    const { label: channelLabel, uuid: clientId } =
      parseConnectionName(this.prefix, port.name) ?? {};
    if (channelLabel !== ChannelLabel.TRANSPORT || !clientId) {
      return;
    }

    if (this.sessions.has(clientId)) {
      throw new Error(`Session collision: ${clientId}`);
    }

    // checking port sender is async, but listeners must attach immediately
    this.attachListeners(port, this.validateSender(port), clientId);
  };

  private attachListeners = (
    unverifiedPort: PortWithSenderOrigin,
    verifiedPort: Promise<PortWithSenderOrigin>,
    sessionId: string,
  ) => {
    const sender = unverifiedPort.sender;

    const ac = new AbortController();
    const session: CRSession = {
      abort: (r?: unknown) => ac.abort(r),
      signal: ac.signal,
      sessionId,
      origin: sender.origin,
      sender,
      verifiedPort,
      requests: new Map(),
    };

    this.sessions.set(sessionId, session);

    session.signal.addEventListener('abort', () => {
      unverifiedPort.disconnect();
      session.requests.forEach(request => request.abort(session.signal.reason));
      this.sessions.delete(sessionId);
    });
    unverifiedPort.onDisconnect.addListener(() => session.abort());

    unverifiedPort.onMessage.addListener(
      (i: unknown) =>
        void verifiedPort.then(p => {
          try {
            if (isTransportAbort(i)) {
              session.requests.get(i.requestId)?.abort();
            } else if (isTransportMessage(i)) {
              void this.clientMessageHandler(session, i).then(res => p.postMessage(res));
            } else {
              console.warn('Unknown item in transport', i);
            }
          } catch (e) {
            session.abort(e);
          }
        }),
    );
  };

  /**
   * This method enters the router, and returns a response.
   *
   * It expects a single message, so only supports unary requests and
   * server-streaming requests. This should *always successfully return* a
   * `TransportEvent`, containing json representing a response or json
   * representing an error.
   */
  private clientMessageHandler(
    session: CRSession,
    { requestId, message }: TransportMessage,
  ): Promise<TransportMessage | TransportInitChannel | TransportError<string | undefined>> {
    if (session.requests.has(requestId)) {
      throw new Error(`Request collision: ${requestId}`);
    }
    const requestController = new AbortController();

    session.requests.set(requestId, requestController);
    return this.handler(message, AbortSignal.any([session.signal, requestController.signal]))
      .then(response =>
        response instanceof ReadableStream
          ? this.responseChannelStream(requestController.signal, {
              requestId,
              stream: response,
            })
          : { requestId, message: response },
      )
      .catch((error: unknown) => ({
        requestId,
        error: errorToJson(ConnectError.from(error), undefined),
      }))
      .finally(() => session.requests.delete(requestId));
  }

  /**
   * Streams are not jsonifiable, so this function sinks a response stream
   * into a dedicated chrome runtime channel, for reconstruction by the
   * client.
   *
   * A jsonifiable message identifying a unique connection name is returned
   * and should be transported to the client.  The client should open a
   * connection bearing this name to source the stream.
   *
   * TODO: time out if the client fails to initiate a connection
   */
  private responseChannelStream(
    signal: AbortSignal,
    { requestId, stream }: TransportStream,
  ): TransportInitChannel {
    const channel = nameConnection(this.prefix, ChannelLabel.STREAM);
    const sinkListener = (p: chrome.runtime.Port) => {
      if (p.name !== channel) {
        return;
      }
      chrome.runtime.onConnect.removeListener(sinkListener);
      void stream
        .pipeTo(new WritableStream(new PortStreamSink(p)), { signal })
        .catch((e: unknown) => console.debug('session-manager makeChannelStreamResponse', e));
    };
    chrome.runtime.onConnect.addListener(sinkListener);
    return { requestId, channel };
  }
}
