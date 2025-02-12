import { Code, ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  isTransportAbort,
  isTransportError,
  isTransportEvent,
  isTransportMessage,
  isTransportStream,
  type TransportAbort,
  type TransportError,
  type TransportMessage,
  type TransportStream,
} from '@penumbra-zone/transport-dom/messages';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { isTransportInitChannel, type TransportInitChannel } from './message.js';
import { PortStreamSink, PortStreamSource } from './stream.js';

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
 * Content scripts are ultimately untrusted, so the counterpart session manager
 * is considered responsible for all validation.
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

  /** Private constructor. Launch a session with `CRSessionClient.init`. */
  private constructor(
    private readonly clientPort: MessagePort,
    private readonly managerId: string,
  ) {
    // create a permanent, unique session name
    this.sessionName = nameConnection(managerId, ChannelLabel.TRANSPORT);

    // listen to service
    this.servicePort = chrome.runtime.connect({
      includeTlsChannelId: true,
      name: this.sessionName,
    });
    this.servicePort.onDisconnect.addListener(this.reconnect);
    this.servicePort.onMessage.addListener(this.serviceListener);

    // listen to client
    this.clientPort.addEventListener('message', this.clientListener);
    if (globalThis.__DEV__) {
      this.clientPort.addEventListener('messageerror', ev =>
        console.warn('CRSessionClient.clientPort messageerror', ev),
      );
    }
    this.clientPort.start();
  }

  /**
   * Establishes a new session client.
   *
   * @param managerId identifies the counterpart session manager
   * @returns a `MessagePort` that can be provided to DOM channel transports
   */
  public static init(managerId: string): MessagePort {
    const { port1, port2 } = new MessageChannel();
    new CRSessionClient(port1, managerId);
    return port2;
  }

  /** Just some typed wrappers for consistency, in a namespace. */
  private send = {
    /** Forward a service-emitted response or error (response failure) to the client. */
    response: (msg: TransportMessage | TransportStream | TransportError) => {
      'stream' in msg
        ? this.clientPort.postMessage(msg, [msg.stream])
        : this.clientPort.postMessage(msg);
    },

    /** Forward a client-emitted request or abort (request cancel) to the service. */
    request: (msg: TransportMessage | TransportInitChannel | TransportAbort) => {
      this.servicePort.postMessage(msg);
    },

    /**
     * Serialize and report a local error to the client. If `requestId` is
     * provided, it will be used to reject that pending request.
     */
    failure: (cause: unknown, requestId?: string) => {
      if (globalThis.__DEV__) {
        console.warn('CRSessionClient failure', cause);
      }
      const connectError = ConnectError.from(cause);
      const msg: TransportError = {
        requestId,
        metadata: Array.from(connectError.metadata.entries()),
        error: errorToJson(connectError, undefined),
      };
      this.clientPort.postMessage(msg);
    },
  };

  /**
   * Used to tear down this session.
   *
   * Announces closure from this side towards the document, and ensures closure
   * of both ports. Listeners are automatically gargbage-collected. This session
   * is complete.
   */
  private disconnect = () => {
    // announce closure, ok even if already closed
    this.clientPort.postMessage(false);
    this.pendingChannels.forEach(ac => ac.abort());

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
   * @param tev `TransportEvent` or `false` message payload
   */
  private clientListener = ({ data: tev }: MessageEvent<unknown>) => {
    if (tev === false) {
      // client announced closure
      this.disconnect();
    } else if (isTransportEvent(tev)) {
      // event contains a requestId
      const { requestId } = tev;
      try {
        if (isTransportAbort(tev, requestId)) {
          // abort control for a specific request
          this.send.request(tev);

          // only pending client-stream requests are aborted here.
          // - active client-stream requests abort via stream control.
          // - server-stream responses abort via stream control.
          // - non-streaming messages need no abort control.
          this.pendingChannels.get(requestId)?.abort();
        } else if (isTransportMessage(tev, requestId)) {
          // request, client message
          this.send.request(tev);
        } else if (isTransportStream(tev, requestId)) {
          // request, client stream
          this.send.request(this.requestChannelStream(tev));
        } else {
          // something unsupported
          const unsupported = new ConnectError(
            'Unsupported request from client',
            Code.Unimplemented,
            getHeader(tev),
            undefined,
            tev,
          );
          this.send.failure(unsupported, requestId);
        }
      } catch (cause) {
        this.send.failure(cause, requestId);
      }
    } else {
      this.send.failure(new TypeError('Unknown item from client', { cause: tev }));
    }
  };

  /**
   * Listens for events from the service, and forwards them to the client.
   *
   * If an unidentifiable event arrives, this handler will report the failure
   * back to the specific request if possible, or, as a top-level transport
   * error.
   *
   * @param tev service-emitted event
   */
  private serviceListener = (tev: unknown) => {
    if (isTransportEvent(tev)) {
      // event contains a requestId
      const { requestId } = tev;
      try {
        if (isTransportError(tev, requestId)) {
          // error control for a specific request
          this.send.response(tev);
        } else if (isTransportMessage(tev, requestId)) {
          // response, server message
          this.send.response(tev);
        } else if (isTransportInitChannel(tev)) {
          // response, server stream
          this.send.response(this.responseChannelStream(tev));
        } else {
          // something unsupported
          const unsupported = new ConnectError(
            'Unsupported response from service',
            Code.Unimplemented,
            getHeader(tev),
            undefined,
            tev,
          );
          this.send.failure(unsupported, requestId);
        }
      } catch (cause) {
        this.send.failure(cause, requestId);
      }
    } else {
      this.send.failure(new TypeError('Unknown item from service', { cause: tev }));
    }
  };

  /**
   * Support server-stream responses. Takes a message representing a subchannel,
   * and sources that into a stream.
   *
   * @param channel a name identifying the subchannel
   * @param requestId a request identifier
   * @returns a response stream
   */
  private responseChannelStream = ({
    channel,
    requestId,
  }: TransportInitChannel): TransportStream => {
    const sourcePort = chrome.runtime.connect({ name: channel });
    const stream = new ReadableStream(new PortStreamSource(sourcePort));
    return { requestId, stream };
  };

  /**
   * Support client-stream requests. Sinks a stream into a subchannel,
   * represented by the return message.
   *
   * @param stream a stream of JSON messages
   * @param requestId a request identifier
   * @returns a message identifying the subchannel
   */
  private requestChannelStream = ({ requestId, stream }: TransportStream): TransportInitChannel => {
    if (!globalThis.__DEV__) {
      throw new ConnectError('Unknown request kind', Code.Unimplemented);
    }
    const channel = nameConnection(this.managerId, ChannelLabel.STREAM);

    const ac = new AbortController();
    this.pendingChannels.set(requestId, ac);

    /** Listen for connection by unique name, accepting this client-stream
     * request. Content scripts only connect to the parent extension. */
    const sinkListener = (sinkPort: chrome.runtime.Port) => {
      if (sinkPort.name === channel) {
        chrome.runtime.onConnect.removeListener(sinkListener);
        void stream
          .pipeTo(new WritableStream(new PortStreamSink(sinkPort)), { signal: ac.signal })
          .catch((cause: unknown) => this.send.failure(cause, requestId))
          .finally(() => sinkPort.disconnect());
      }
    };

    chrome.runtime.onConnect.addListener(sinkListener);
    AbortSignal.any([ac.signal, AbortSignal.timeout(60_000)]).addEventListener('abort', () => {
      chrome.runtime.onConnect.removeListener(sinkListener);
    });

    return { requestId, channel };
  };
}
