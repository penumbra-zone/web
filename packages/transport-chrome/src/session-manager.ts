import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import {
  isTransportAbort,
  isTransportEvent,
  isTransportMessage,
  TransportEvent,
  TransportMessage,
  TransportStream,
} from '@penumbra-zone/transport-dom/messages';
import { nameConnection, parseConnectionName } from './channel-names.js';
import { isTransportInitChannel, TransportInitChannel } from './message.js';
import { PortStreamSink } from './stream.js';

interface CRSession extends AbortController {
  clientId: string;
  port: chrome.runtime.Port;
  origin: string;
  requests: Map<string, AbortController>;
}

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
 * call that activates this manager, and you should use normal DOM messaging.
 */

export class CRSessionManager {
  private static singleton?: CRSessionManager;
  private sessions = new Map<string, CRSession>();

  constructor(
    private readonly prefix: string,
    private readonly checkSender: (
      sender?: chrome.runtime.MessageSender,
    ) => Promise<{ origin: string }>,
    private readonly handler: ChannelHandlerFn,
  ) {
    if (CRSessionManager.singleton) {
      throw new Error('Already constructed');
    }
    chrome.runtime.onConnect.addListener(this.transportConnection);
  }

  /**
   *
   * @param prefix a string containing no spaces, matching the prefix used in your content script
   * @param handler your router entry function
   */
  public static init = (...args: ConstructorParameters<typeof CRSessionManager>) => {
    CRSessionManager.singleton ??= new CRSessionManager(...args);
    return CRSessionManager.singleton.sessions;
  };

  public static killOrigin = (targetOrigin: string) => {
    if (CRSessionManager.singleton) {
      CRSessionManager.singleton.sessions.forEach(session => {
        if (session.origin === targetOrigin) {
          session.port.disconnect();
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
  private transportConnection = (clientPort: chrome.runtime.Port) => {
    if (!clientPort.name.startsWith(this.prefix)) {
      return;
    }

    // parse the name
    const { label: channelLabel, uuid: clientId } =
      parseConnectionName(this.prefix, clientPort.name) ?? {};
    if (channelLabel !== 'TRANSPORT' || !clientId) {
      return;
    }

    if (this.sessions.has(clientId)) {
      throw new Error(`Session collision: ${clientId}`);
    }

    void this.checkSender(clientPort.sender).then(({ origin: senderOrigin }) => {
      if (globalThis.__DEV__) {
        console.debug('transportConnection checked sender', { clientId, senderOrigin });
      }
      const session: CRSession = Object.assign(new AbortController(), {
        clientId,
        origin: senderOrigin,
        port: clientPort,
        requests: new Map(),
      });

      this.sessions.set(clientId, session);

      session.signal.addEventListener('abort', () => {
        if (this.sessions.delete(clientId)) {
          clientPort.disconnect();
        }
        session.requests.forEach(request => request.abort(session.signal.reason));
      });

      clientPort.onDisconnect.addListener(() => {
        if (this.sessions.delete(clientId)) {
          session.abort('Disconnect');
        }
      });

      const clientListener = (msg: unknown) => {
        if (isTransportEvent(msg)) {
          const { requestId } = msg;
          try {
            if (isTransportAbort(msg, requestId)) {
              session.requests.get(requestId)?.abort('Abort request');
            } else if (isTransportMessage(msg, requestId)) {
              void this.clientMessageHandler(session, msg).then(res => clientPort.postMessage(res));
            } else if (isTransportInitChannel(msg)) {
              console.warn('Client streaming unimplemented');
              /*
            if (globalThis.__DEV__) {
              void this.clientMessageHandler(await this.acceptChannelStreamRequest(i)).then(res =>
                p.postMessage(res),
              );
            }
            */
            } else {
              console.warn('Unknown item in transport', msg);
            }
          } catch (e) {
            session.abort(e);
          }
        }
      };

      clientPort.onMessage.addListener(clientListener);
    });
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
  ): Promise<TransportEvent> {
    if (session.requests.has(requestId)) {
      throw new Error(`Request collision: ${requestId}`);
    }
    const requestController = new AbortController();
    session.requests.set(requestId, requestController);
    return this.handler(message, requestController.signal)
      .then(response =>
        response instanceof ReadableStream
          ? this.responseChannelStream(requestController.signal, { requestId, stream: response })
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
   * @todo time out if the client fails to initiate a connection
   */
  private responseChannelStream(
    signal: AbortSignal,
    { requestId, stream }: TransportStream,
  ): TransportInitChannel {
    const channel = nameConnection(this.prefix, 'STREAM');
    const sinkListener = (sinkPort: chrome.runtime.Port) => {
      if (sinkPort.name === channel) {
        chrome.runtime.onConnect.removeListener(sinkListener);
        void stream
          .pipeTo(new WritableStream(new PortStreamSink(sinkPort)), { signal })
          .finally(() => sinkPort.disconnect());
      }
    };
    signal.addEventListener('abort', () => chrome.runtime.onConnect.removeListener(sinkListener));
    chrome.runtime.onConnect.addListener(sinkListener);
    return { requestId, channel };
  }

  /*
  private acceptChannelStreamRequest = async ({
    requestId,
    channel: name,
  }: TransportInitChannel): Promise<TransportStream> => {
    const port = chrome.runtime.connect({ name });
    await this.checkSender(port.sender);
    return {
      requestId,
      stream: new ReadableStream(new PortStreamSource(port)),
    };
  };
  */
}
