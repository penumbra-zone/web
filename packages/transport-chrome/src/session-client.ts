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
import { PortStreamSink } from './stream/sink.js';
import { PortStreamSource } from './stream/source.js';
import { isContextLossError } from './util/chrome-errors.js';
import { isTransportCancelledError } from './util/rpc-errors.js';

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
  private servicePort?: chrome.runtime.Port;
  private ac = new AbortController();

  /** Private constructor. Launch a session with `CRSessionClient.init`. */
  private constructor(
    private readonly managerId: string,
    private readonly clientPort: MessagePort,
  ) {
    // create a permanent, unique session name
    this.sessionName = nameConnection(this.managerId, ChannelLabel.TRANSPORT);

    // connect to service
    this.servicePort = this.connect();

    this.ac.signal.addEventListener('abort', () => {
      if (!isTransportCancelledError(this.ac.signal.reason)) {
        console.error('session-client signal', this.ac.signal.reason);
        this.reportError({
          requestId: undefined,
          error: errorToJson(ConnectError.from(this.ac.signal.reason), undefined),
        });
      }
      // announce closure to client
      this.clientPort.postMessage(false);
      this.clientPort.close();
      this.servicePort?.disconnect();
    });

    // listen to client
    this.clientPort.addEventListener('message', this.clientListener);
    if (globalThis.__DEV__) {
      console.debug('CRSessionClient', this.sessionName);
      this.clientPort.addEventListener('messageerror', ev =>
        console.debug('session-client messageerror', ev),
      );
    }
    this.clientPort.start();
  }

  private connect = () => {
    this.ac.signal.throwIfAborted();
    if (globalThis.__DEV__) {
      console.debug('session-client connecting', this.sessionName);
    }
    try {
      const port = chrome.runtime.connect({
        name: this.sessionName,
        includeTlsChannelId: true,
      });
      port.onMessage.addListener(this.serviceListener);
      port.onDisconnect.addListener(() => {
        // clear the port so subsequent requests may reconnect
        this.servicePort = undefined;
      });
      return port;
    } catch (failedConnect) {
      throw isContextLossError(failedConnect)
        ? ConnectError.from(failedConnect, Code.Unavailable)
        : failedConnect;
    }
  };

  /**
   * Establishes a new session client.
   *
   * @param managerId identifies the counterpart session manager
   * @returns a `MessagePort` that can be provided to DOM channel transports
   */
  public static init(managerId: string): MessagePort {
    const { port1, port2 } = new MessageChannel();
    new CRSessionClient(managerId, port1);
    return port2;
  }

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
  private clientListener = (ev: MessageEvent<unknown>) => {
    try {
      if (ev.data === false) {
        throw ConnectError.from('Transport closed', Code.Canceled);
      } else if (!isTransportEvent(ev.data)) {
        throw new TypeError('Unknown item from client', { cause: ev.data });
      } else {
        // ensure a connection is established
        this.servicePort ??= this.connect();

        // begin handling the event
        const tev = ev.data;
        try {
          if (isTransportAbort(tev)) {
            // abort control for some request
            this.postAbort(tev);
          } else if (isTransportMessage(tev)) {
            // message request
            this.postRequest(tev);
          } else if (isTransportStream(tev) && globalThis.__DEV__) {
            // streaming request
            this.postRequest(this.offerStreamRequest(tev));
          } else {
            throw ConnectError.from(
              new TypeError('Unsupported request from client', { cause: tev }),
              Code.Unimplemented,
            );
          }
        } catch (cause) {
          // something went wrong, but it's scoped to this event
          if (globalThis.__DEV__) {
            console.debug('session-client request error', cause, tev);
          }
          this.reportError({
            requestId: tev.requestId,
            error: errorToJson(ConnectError.from(cause), undefined),
          });
        }
      }
    } catch (failedHandling) {
      // something went wrong, and we can't scope it to a request
      this.ac.abort(failedHandling);
    }
  };

  /**
   * Listens for events from the service, and forwards them to the client.
   *
   * If an unidentifiable event arrives, this handler will report the failure
   * back to the specific request if possible, or, as a top-level transport
   * error.
   */
  private serviceListener = (tev: unknown) => {
    if (!isTransportEvent(tev)) {
      // something is wrong, and we can't scope it to a request
      this.ac.abort(new Error('Unknown item from service', { cause: tev }));
    } else {
      try {
        if (isTransportError(tev)) {
          // error control for some request
          this.reportError(tev);
        } else if (isTransportMessage(tev)) {
          // message response
          this.reportResponse(tev);
        } else if (isTransportInitChannel(tev)) {
          // streaming response
          this.reportResponse(this.acceptStreamResponse(tev));
        } else {
          throw new ConnectError(
            'Unsupported response from service',
            Code.Unimplemented,
            undefined,
            undefined,
            tev,
          );
        }
      } catch (cause) {
        // something went wrong, but it's scoped to this event
        if (globalThis.__DEV__) {
          console.debug('session-client response error', cause, tev);
        }
        this.reportError({
          requestId: tev.requestId,
          error: errorToJson(ConnectError.from(cause), undefined),
        });
      }
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
  private acceptStreamResponse = ({ channel, ...rest }: TransportInitChannel): TransportStream => {
    const sourcePort = chrome.runtime.connect({ name: channel });
    const stream = new ReadableStream(new PortStreamSource(sourcePort));
    return { ...rest, stream };
  };

  /**
   * Support client-stream requests. Sinks a stream into a subchannel,
   * represented by the returned channel init message.
   *
   * @param stream a stream of JSON messages
   * @param requestId a request identifier
   * @returns a message identifying the subchannel
   */
  private offerStreamRequest = ({ stream, ...rest }: TransportStream): TransportInitChannel => {
    const channel = nameConnection(this.managerId, ChannelLabel.STREAM);

    const initTimeoutMs = Number(new Headers(rest.header).get('headerTimeout') ?? 60_000);

    /** Listen for connection by unique name, accepting this client-stream
     * request. Content scripts only connect to the parent extension. */
    const sinkListener = (sinkPort: chrome.runtime.Port) => {
      if (sinkPort.name === channel) {
        chrome.runtime.onConnect.removeListener(sinkListener);
        const sink = new WritableStream(new PortStreamSink(sinkPort));
        void stream.pipeTo(sink, { signal: this.ac.signal }).catch((cause: unknown) => {
          if (globalThis.__DEV__) {
            console.debug('offerStreamRequest pipe failed', cause);
          }
        });
      }
    };

    chrome.runtime.onConnect.addListener(sinkListener);

    AbortSignal.any([this.ac.signal, AbortSignal.timeout(initTimeoutMs)]).addEventListener(
      'abort',
      () => chrome.runtime.onConnect.removeListener(sinkListener),
    );

    return { ...rest, channel };
  };

  private assertService = (): chrome.runtime.Port => {
    if (!this.servicePort) {
      throw ConnectError.from('Not connected', Code.Unavailable);
    }
    return this.servicePort;
  };

  /** Forward a client-emitted request or request cancellation to the service. */
  private postRequest = (msg: TransportMessage | TransportInitChannel) =>
    this.assertService().postMessage(msg);

  /** Forward a client-emitted cancellation to the service. */
  private postAbort = (msg: TransportAbort) => this.assertService().postMessage(msg);

  /** Report an service-emitted error or a locally-raised error to the client. */
  private reportError = (msg: TransportError<string | undefined>) =>
    this.clientPort.postMessage(msg);

  /** Forward a service-emitted response to the client. */
  private reportResponse = (msg: TransportMessage | TransportStream) =>
    'stream' in msg
      ? this.clientPort.postMessage(msg, [msg.stream])
      : this.clientPort.postMessage(msg);
}
