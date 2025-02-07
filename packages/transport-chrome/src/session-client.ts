import {
  isTransportAbort,
  isTransportError,
  isTransportEvent,
  isTransportMessage,
  isTransportStream,
  TransportAbort,
  TransportError,
  TransportMessage,
  TransportStream,
} from '@penumbra-zone/transport-dom/messages';
import { nameConnection } from './channel-names.js';
import { isTransportInitChannel, TransportInitChannel } from './message.js';
import { PortStreamSink, PortStreamSource } from './stream.js';
import { ConnectError, Code } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';

const getHeader = (o: unknown): HeadersInit | undefined => {
  let header: HeadersInit | undefined = undefined;
  if (o != null && typeof o === 'object' && 'header' in o) {
    try {
      header = new Headers(o.header as never);
    } catch (e) {
      // not headers
    }
  }
  return header;
};
/**
 * Transparently adapts `Transport`s using `MessageChannel` DOM connections to
 * use Chrome `chrome.runtime.Port` extension connections.
 *
 * Simple handlers unconditionally forward messages back and forth. Channel
 * disconnects are detected, and transparently re-established if possible.
 *
 * Only basic structural typing is performed, because content scripts are
 * ultimately untrusted. The session manager is responsible for validation.
 *
 * The chrome runtime does not support object transfer, so `ReadableStream` or
 * `AsyncIterable` cannot cross the message boundary. Instead, `PortStreamSink`
 * and `PortStreamSource` are used with dedicated sub-channels to encapsulate
 * streams.
 */
export class CRSessionClient {
  private readonly sessionName: string;
  private servicePort: chrome.runtime.Port;

  private pendingChannels = new Map<string, AbortController>();

  private constructor(
    private readonly prefix: string,
    private readonly clientPort: MessagePort,
  ) {
    // create a permanent, unique session name
    this.sessionName = nameConnection(prefix, 'TRANSPORT');

    // listen to service
    this.servicePort = chrome.runtime.connect({
      includeTlsChannelId: true,
      name: this.sessionName,
    });
    this.servicePort.onDisconnect.addListener(this.reconnect);
    this.servicePort.onMessage.addListener(this.serviceListener);

    // listen to client
    this.clientPort.addEventListener('message', this.clientListener);
    this.clientPort.start();
  }

  /** Send a response to the client, or a request-specific error. */
  private postClient = (msg: TransportMessage | TransportStream | TransportError<string>) =>
    'stream' in msg
      ? this.clientPort.postMessage(msg, [msg.stream])
      : this.clientPort.postMessage(msg);

  /** Send a request or request abort to the service. */
  private postService = (msg: TransportMessage | TransportInitChannel | TransportAbort) =>
    this.servicePort.postMessage(msg);

  /** Send a nonspecific transport-level error to the client.  */
  private postTransportError = (cause: unknown) =>
    this.clientPort.postMessage({
      error: errorToJson(ConnectError.from(cause), undefined),
    });

  /**
   * Establishes a new session client.
   *
   * @param prefix a string prefix for channel names
   * @returns a `MessagePort` that can be provided to DOM channel transports
   */
  public static init(prefix: string): MessagePort {
    const { port1, port2 } = new MessageChannel();
    new CRSessionClient(prefix, port1);
    return port2;
  }

  /**
   * Used when the client announces port closure. Tears down both ports.
   *
   * @todo verify this is enough to allow garbage collection
   */
  private disconnect = () => {
    this.clientPort.removeEventListener('message', this.clientListener);
    this.clientPort.postMessage(false);
    this.clientPort.close();

    this.servicePort.disconnect();
  };

  /**
   * Used when the service port disconnects. Tears down the service port and
   * reconnects, creating a new service port.
   */
  private reconnect = () => {
    this.servicePort = chrome.runtime.connect({
      name: this.sessionName,
      includeTlsChannelId: true,
    });
    this.servicePort.onMessage.addListener(this.serviceListener);
    this.servicePort.onDisconnect.addListener(this.reconnect);
  };

  /**
   * Listens for messages from the client, and forwards them to the service.
   *
   * If an unidentifiable message arrives, this handler will report the failure
   * back to the specific request if possible, or, as a top-level transport
   * error.
   *
   * Since a `MessagePort` has no event or callback indicating closure, the
   * client may announce port closure by posting a `false` value.
   *
   * @param evt a `MessageEvent` from the client, possibly containing `false` or `TransportEvent` data.
   */
  private clientListener = ({ data: msg }: MessageEvent<unknown>) => {
    if (msg === false) {
      // client-initiated teardown
      this.disconnect();
    } else if (isTransportEvent(msg)) {
      const { requestId } = msg;
      try {
        if (isTransportAbort(msg, requestId)) {
          // abort control for a specific request.
          this.postService(msg);

          // only pending client-stream requests are aborted here.
          // - active client-stream requests abort via stream control.
          // - server-stream responses abort via stream control.
          // - non-streaming messages need no abort control.
          this.pendingChannels.get(requestId)?.abort();
        } else if (isTransportMessage(msg, requestId)) {
          // request, client message
          this.postService(msg);
        } else if (isTransportStream(msg, requestId)) {
          // request, client stream
          const ac = new AbortController();
          this.pendingChannels.set(requestId, ac);
          this.postService(this.requestChannelStream(ac.signal, msg));
        } else {
          // something unsupported
          throw new ConnectError(
            'Unsupported request from client',
            Code.Unimplemented,
            getHeader(msg),
            undefined,
            msg,
          );
        }
      } catch (failure) {
        console.warn('Failed to forward client message', failure);
        // fail the request
        this.postClient({
          error: errorToJson(ConnectError.from(failure), undefined),
          requestId,
        });
      }
    } else {
      // fail the transport
      this.postTransportError(
        new ConnectError('Unknown item from client', Code.Unknown, getHeader(msg), undefined, msg),
      );
    }
  };

  /**
   * Listens for messages from the service, and forwards them to the client.
   *
   * If an unidentifiable message arrives, this handler will report the failure
   * back to the specific request if possible, or, as a top-level transport
   * error.
   *
   * @param msg a message from the service
   */
  private serviceListener = (msg: unknown) => {
    if (isTransportEvent(msg)) {
      const { requestId } = msg;
      try {
        if (isTransportError(msg, requestId)) {
          // error control for a specific request
          this.postClient(msg);
        } else if (isTransportMessage(msg, requestId)) {
          // response, server message
          this.postClient(msg);
        } else if (isTransportInitChannel(msg)) {
          // response, server stream
          this.postClient(this.acceptChannelStreamResponse(msg));
        } else {
          // something unsupported
          throw new ConnectError(
            'Unsupported response from service',
            Code.Unimplemented,
            getHeader(msg),
            undefined,
            msg,
          );
        }
      } catch (failure) {
        console.warn('Failed to forward service message', failure);
        // fail the request
        this.postClient({
          error: errorToJson(ConnectError.from(failure), undefined),
          requestId,
        });
      }
    } else {
      // fail the transport
      this.postTransportError(
        new ConnectError('Unknown item from service', Code.Unknown, getHeader(msg), undefined, msg),
      );
    }
  };

  /**
   * Support server-stream responses. Takes a message representing a subchannel,
   * and sources that into a stream.
   *
   * @param msg a message identifying the subchannel
   * @returns a response stream
   */
  private acceptChannelStreamResponse = ({
    requestId,
    channel,
  }: TransportInitChannel): TransportStream => {
    const sourcePort = chrome.runtime.connect({ name: channel });
    const stream = new ReadableStream(new PortStreamSource(sourcePort));
    return { requestId, stream };
  };

  /**
   * Support client-stream requests. Sinks a stream into a subchannel,
   * represented by the return message.
   *
   * @param msg a request stream
   * @returns a message identifying the subchannel
   */
  private requestChannelStream = (
    signal: AbortSignal,
    { requestId, stream }: TransportStream,
  ): TransportInitChannel => {
    const channel = nameConnection(this.prefix, 'STREAM');

    const listenerCleanup = () => {
      this.pendingChannels.delete(requestId);
      chrome.runtime.onConnect.removeListener(sinkListener);
      signal.removeEventListener('abort', listenerCleanup);
    };

    /**
     * Listen for a connection accepting this client-stream request. Executed in
     * a content script, this may only connect to its corresponding extension
     * backend. This handler will only accept a counterpart holding the unique
     * name generated by `nameConnection`. So this is quite safe.
     *
     * @todo with some configurable way to check `streamPort.sender`, it may be
     * possible to expand use-cases.
     * @todo catch failures from `pipeTo`?
     */
    const sinkListener = (sinkPort: chrome.runtime.Port) => {
      if (sinkPort.name === channel) {
        listenerCleanup();
        void stream
          .pipeTo(new WritableStream(new PortStreamSink(sinkPort)), { signal })
          .finally(() => sinkPort.disconnect());
      }
    };

    if (signal.aborted) {
      listenerCleanup();
    } else {
      chrome.runtime.onConnect.addListener(sinkListener);
      signal.addEventListener('abort', listenerCleanup);
    }

    return { requestId, channel };
  };
}
