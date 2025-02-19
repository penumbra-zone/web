import { Code, ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  isTransportAbort,
  isTransportError,
  isTransportEvent,
  isTransportMessage,
  TransportAbort,
  TransportError,
  TransportMessage,
  TransportStream,
} from '@penumbra-zone/transport-dom/messages';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { isTransportInitChannel, type TransportInitChannel } from './message.js';
import { PortStreamSource } from './stream/source.js';

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

  /** Private constructor. Launch a session with `CRSessionClient.init`. */
  private constructor(
    private readonly managerId: string,
    private readonly clientPort: MessagePort,
  ) {
    // create a permanent, unique session name
    this.sessionName = nameConnection(this.managerId, ChannelLabel.TRANSPORT);

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
        console.debug('session-client messageerror', ev),
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
    new CRSessionClient(managerId, port1);
    return port2;
  }

  /**
   * Serialize and report a local error to the client. If `requestId` is
   * provided, it will be used to reject that pending request.
   */
  private clientPostError = (cause: unknown, requestId?: string) => {
    const connectError = ConnectError.from(cause);
    if (globalThis.__DEV__) {
      console.warn('session-client error', cause, connectError);
    }
    const metadata: [string, string][] = Array.from(connectError.metadata);
    const msg: TransportError<string | undefined> = {
      requestId,
      metadata: metadata.length ? metadata : undefined,
      error: errorToJson(connectError, undefined),
    };
    this.clientPort.postMessage(msg);
  };

  /**
   * Used to tear down this session when the client announces channel closure.
   *
   * Announces closure from this side towards the document, and ensures closure
   * of both ports. Listeners are automatically gargbage-collected. This session
   * is complete.
   */
  private disconnect = () => {
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
   * @param tev `TransportEvent` or `false` message payload
   */
  private clientListener = (ev: MessageEvent<unknown>) => {
    if (ev.data === false) {
      // client announced closure
      this.disconnect();
    } else if (isTransportEvent(ev.data)) {
      const tev = ev.data;
      try {
        if (
          // abort control for a specific request
          isTransportAbort(tev) ||
          // request, client message
          isTransportMessage(tev)
        ) {
          this.servicePostRequest(tev);
        } else {
          // something unsupported
          throw new ConnectError('Unsupported request from client', Code.Unimplemented);
        }
      } catch (cause) {
        this.clientPostError(cause, tev.requestId);
      }
    } else {
      this.clientPostError(new ConnectError('Unknown item from client', Code.Unknown));
    }
  };

  /**
   * Listens for events from the service, and forwards them to the client.
   *
   * If an unidentifiable event arrives, this handler will report the failure
   * back to the specific request if possible, or, as a top-level transport
   * error.
   *
   * @param msg service-emitted event
   */
  private serviceListener = (msg: unknown) => {
    if (isTransportEvent(msg)) {
      // event contains a requestId
      const { requestId } = msg;
      try {
        if (isTransportError(msg)) {
          // error control for a specific request
          this.clientPostResponse(msg);
        } else if (isTransportMessage(msg)) {
          // response, server message
          this.clientPostResponse(msg);
        } else if (isTransportInitChannel(msg)) {
          // response, server stream
          this.clientPostResponse(this.acceptChannelStreamResponse(msg));
        } else {
          // something unsupported
          throw ConnectError.from('Unsupported response from service', Code.Unimplemented);
        }
      } catch (failure) {
        this.clientPostError(failure, requestId);
      }
    } else {
      this.clientPostError(ConnectError.from('Unknown item from service'), undefined);
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
  private acceptChannelStreamResponse = ({ requestId, channel: name }: TransportInitChannel) => {
    const stream = new ReadableStream(new PortStreamSource(chrome.runtime.connect({ name })));
    return { requestId, stream };
  };

  /** Forward a service-emitted response or error (response failure) to the client. */
  private clientPostResponse = (
    msg: TransportMessage | TransportStream | TransportError<string>,
  ) => {
    'stream' in msg
      ? this.clientPort.postMessage(msg, [msg.stream])
      : this.clientPort.postMessage(msg);
  };

  /** Forward a client-emitted request or abort (request cancel) to the service. */
  private servicePostRequest = (msg: TransportMessage | TransportInitChannel | TransportAbort) => {
    this.servicePort.postMessage(msg);
  };
}
