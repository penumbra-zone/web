import { Code, ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { ChannelLabel, nameConnection, parseConnectionName } from './channel-names';
import { isTransportInitChannel, TransportInitChannel } from './message';
import { PortStreamSink } from './stream';
import { ChannelHandlerFn } from '@penumbra-zone/transport-dom/adapter';
import {
  isTransportMessage,
  TransportError,
  TransportEvent,
  TransportMessage,
  TransportStream,
} from '@penumbra-zone/transport-dom/messages';

interface CRSession {
  acont: AbortController;
  port: chrome.runtime.Port;
  sender: chrome.runtime.MessageSender;
}

/**
 * Only for use as an extension-level singleton by the extension's main
 * background worker.
 *
 * Currently this supports
 * - connections from content scripts
 * - connections from pages in this extension
 * - connections from workers in this extension
 * - if external is true, connections from other extensions or pages (experimental)
 *
 * This does not support
 * - connections from a script back to itself
 *
 * In the future we may want to support
 * - connections from native applications
 *
 * If you are connecting from the same worker running this script (currently,
 * service-to-service communication) you cannot make a `chrome.runtime.connect`
 * call that activates this manager, and you should use normal DOM messaging.
 */

export class CRSessionManager {
  private static singleton?: CRSessionManager;
  private sessions = new Map<string, CRSession>();

  private constructor(
    private prefix: string,
    private handler: ChannelHandlerFn,
    private approvedSender: (sender: chrome.runtime.MessageSender) => Promise<boolean>,
    private external: boolean,
  ) {
    if (CRSessionManager.singleton) throw new Error('Already constructed');
    const connect = (port: chrome.runtime.Port) =>
      void (
        port.sender &&
        this.approvedSender(port.sender).then(
          ok => ok && this.transportConnection(port),
          err => console.warn(err),
        )
      );
    if (this.external) chrome.runtime.onConnectExternal.addListener(connect);
    chrome.runtime.onConnect.addListener(connect);
  }

  /**
   * @param prefix a string containing no spaces, matching the prefix used in your content script
   * @param handler your router entry function
   * @param external if true, apply handlers to onConnectExternal
   */
  public static init = (
    prefix: string,
    handler: ChannelHandlerFn,
    approvedSender: (sender?: chrome.runtime.MessageSender) => Promise<boolean>,
    external = false,
  ) => {
    CRSessionManager.singleton ??= new CRSessionManager(prefix, handler, approvedSender, external);
  };

  /**
   * This handler is called when a new connection is opened from any document
   * with access to the chrome runtime.
   *
   * Here we make an effort to identify these connections. If the name indicates
   * the connection is for this manager, a handler is connected to the port.
   */
  private transportConnection = (port: chrome.runtime.Port) => {
    const { name, sender } = port;

    if (!sender) return;
    if (!name.startsWith(this.prefix)) return;

    // parse the name
    const { label: channelLabel, uuid: sessionId } = parseConnectionName(this.prefix, name) ?? {};
    if (channelLabel !== ChannelLabel.TRANSPORT || !sessionId) return;
    if (this.sessions.has(sessionId)) throw new Error(`Session collision: ${sessionId}`);

    const acont = new AbortController();
    acont.signal.addEventListener('abort', () => port.disconnect());
    port.onDisconnect.addListener(() => acont.abort('Disconnect'));

    this.sessions.set(sessionId, { acont, port, sender });

    port.onMessage.addListener((i, p) => {
      void (async () => {
        try {
          if (isTransportMessage(i))
            p.postMessage(await this.clientMessageHandler(sender, acont.signal, i));
          else if (isTransportInitChannel(i))
            p.postMessage(await this.clientStreamHandler(acont.signal, i));
          else console.warn('Unknown item in transport', i);
        } catch (e) {
          acont.abort(e);
        }
      })();
    });
  };

  /**
   * This method queries the service, then returns a response message or stream.
   * It expects an input of a single request message, so only supports unary
   * server-streaming method kinds.
   *
   * This should *always successfully return* a jsonifiable object, representing
   * a response or error.
   */
  private clientMessageHandler(
    client: chrome.runtime.MessageSender,
    signal: AbortSignal,
    { requestId, message }: TransportMessage,
  ): Promise<TransportEvent> {
    return this.handler(message).then(
      response =>
        response instanceof ReadableStream
          ? (this.streamResponse(client, signal, {
              requestId,
              stream: response,
            }) satisfies TransportInitChannel)
          : ({ requestId, message: response } satisfies TransportMessage),
      error =>
        ({
          requestId,
          error: errorToJson(ConnectError.from(error), undefined),
        }) satisfies TransportEvent & TransportError,
    );
  }

  /**
   * Streams are not jsonifiable, so this function sinks a response stream
   * into a dedicated chrome runtime channel, for reconstruction by the
   * client.
   *
   * A jsonifiable message identifying a unique connection name is returned
   * and should be transported to the client.  The client should open a
   * connection bearing this name to source the stream.
   */
  private streamResponse(
    to: chrome.runtime.MessageSender,
    signal: AbortSignal,
    { requestId, stream }: TransportStream,
  ): TransportInitChannel {
    const channel = nameConnection(this.prefix, ChannelLabel.STREAM);
    const sinkListener = (sink: chrome.runtime.Port) => {
      if (sink.name !== channel || sink.sender?.id !== to.id || sink.sender?.origin !== to.origin)
        return;
      removeSinkListener();
      stream.pipeTo(new WritableStream(new PortStreamSink(sink)), { signal }).catch(() => null);
    };

    const removeSinkListener = () => {
      if (this.external) chrome.runtime.onConnectExternal.removeListener(sinkListener);
      chrome.runtime.onConnect.removeListener(sinkListener);
    };
    signal.addEventListener('abort', removeSinkListener);

    if (this.external) chrome.runtime.onConnectExternal.addListener(sinkListener);
    chrome.runtime.onConnect.addListener(sinkListener);
    return { requestId, channel };
  }

  private clientStreamHandler = ({ requestId }: TransportInitChannel) =>
    Promise.resolve({
      requestId,
      error: errorToJson(
        new ConnectError('Client streaming unimplemented', Code.Unimplemented),
        undefined,
      ),
    } satisfies TransportEvent & TransportError);
}
