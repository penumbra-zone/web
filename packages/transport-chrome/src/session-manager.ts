import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { ChannelLabel, nameConnection, parseConnectionName } from './channel-names.js';
import { isTransportInitChannel, TransportInitChannel } from './message.js';
import { PortStreamSink } from './stream/sink.js';
import { PortStreamSource } from './stream/source.js';
import { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import {
  isTransportAbort,
  isTransportMessage,
  TransportEvent,
  TransportMessage,
  TransportStream,
} from '@penumbra-zone/transport-dom/messages';

interface CRSession extends AbortController {
  clientId: string;
  port: chrome.runtime.Port;
  origin: string;
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
  private requests = new Map<string, AbortController>();

  private constructor(
    private prefix: string,
    private handler: ChannelHandlerFn,
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
  public static init = (prefix: string, handler: ChannelHandlerFn) => {
    CRSessionManager.singleton ??= new CRSessionManager(prefix, handler);
    return CRSessionManager.singleton.sessions;
  };

  public static killOrigin = (targetOrigin: string) => {
    if (CRSessionManager.singleton) {
      CRSessionManager.singleton.sessions.forEach(session => {
        if (session.origin === targetOrigin) {
          session.abort(targetOrigin);
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
    const sender = port.sender;
    if (!sender?.origin) {
      return;
    }

    // fast and simple name test, parse later
    if (!port.name.startsWith(this.prefix)) {
      return;
    }

    const fromThisExtension = sender.id === chrome.runtime.id;
    const fromPageHttps =
      !sender.frameId && !!sender.tab?.id && sender.origin.startsWith('https://');
    const isLocalhost =
      sender.origin.startsWith('http://localhost:') || sender.origin === 'http://localhost';

    // Allow connections from the same extension, from https pages, or from http://localhost
    const validOrigin = isLocalhost || fromPageHttps || fromThisExtension;
    if (!validOrigin) {
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

    const session: CRSession = Object.assign(new AbortController(), {
      clientId,
      origin: sender.origin,
      port: port,
    });
    this.sessions.set(clientId, session);

    session.signal.addEventListener('abort', () => port.disconnect());
    port.onDisconnect.addListener(() => session.abort('Disconnect'));

    port.onMessage.addListener((i, p) => {
      try {
        if (isTransportAbort(i)) {
          this.requests.get(i.requestId)?.abort();
        } else if (isTransportMessage(i)) {
          void this.clientMessageHandler(session, i).then(res => p.postMessage(res));
        } else if (isTransportInitChannel(i)) {
          console.warn('Client streaming unimplemented', this.acceptChannelStreamRequest(i));
        } else {
          console.warn('Unknown item in transport', i);
        }
      } catch (e) {
        session.abort(e);
      }
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
    if (this.requests.has(requestId)) {
      throw new Error(`Request collision: ${requestId}`);
    }
    const requestController = new AbortController();
    session.signal.addEventListener('abort', () => requestController.abort());
    this.requests.set(requestId, requestController);
    return this.handler(message, AbortSignal.any([session.signal, requestController.signal]))
      .then(response =>
        response instanceof ReadableStream
          ? this.responseChannelStream(requestController.signal, {
              requestId,
              stream: response as unknown,
            } as TransportStream)
          : ({ requestId, message: response as unknown } as TransportEvent),
      )
      .catch((error: unknown) => ({
        requestId,
        error: errorToJson(ConnectError.from(error), undefined),
      }))
      .finally(() => this.requests.delete(requestId));
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
      void stream.pipeTo(new WritableStream(new PortStreamSink(p)), { signal }).catch(() => null);
    };
    chrome.runtime.onConnect.addListener(sinkListener);
    return { requestId, channel };
  }

  private acceptChannelStreamRequest = ({
    requestId,
    channel: name,
  }: TransportInitChannel): TransportStream => ({
    requestId,
    stream: new ReadableStream(new PortStreamSource(chrome.runtime.connect({ name }))),
  });
}
