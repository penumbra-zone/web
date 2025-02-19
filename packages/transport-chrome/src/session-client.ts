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
    private readonly managerId: string,
    private readonly clientPort: MessagePort,
  ) {
    // create a permanent, unique session name
    this.sessionName = nameConnection(managerId, ChannelLabel.TRANSPORT);

    // listen to service
    this.servicePort = chrome.runtime.connect({
      includeTlsChannelId: true,
      name: this.sessionName,
    });
    this.servicePort.onDisconnect.addListener(this.disconnect);
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
    new CRSessionClient(managerId, port1);
    return port2;
  }

  /** Forward a service-emitted response or error (response failure) to the client. */
  private clientPortPostMessage = (
    msg: TransportMessage | TransportStream | TransportError<string>,
  ) => {
    'stream' in msg
      ? this.clientPort.postMessage(msg, [msg.stream])
      : this.clientPort.postMessage(msg);
  };

  /** Forward a client-emitted request or abort (request cancel) to the service. */
  private servicePortPostMessage = (
    msg: TransportMessage | TransportInitChannel | TransportAbort,
  ) => {
    this.servicePort.postMessage(msg);
  };

  /**
   * Serialize and report a local error to the client. If `requestId` is
   * provided, it will be used to reject that pending request.
   */
  private clientPortPostError = (cause: unknown, requestId?: string) => {
    const connectError = ConnectError.from(cause);
    if (globalThis.__DEV__) {
      console.warn('CRSessionClient failure', cause, connectError);
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
   * Used to tear down this session when the client announces channel closure,
   * or when the extension channel disconnects.
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
      // event contains a requestId
      const { requestId } = ev.data;
      try {
        if (isTransportAbort(ev.data, requestId)) {
          // abort control for a specific request
          this.servicePortPostMessage(ev.data);

          // only pending client-stream requests are aborted here.
          // - active client-stream requests abort via stream control.
          // - server-stream responses abort via stream control.
          // - non-streaming messages need no abort control.
          this.pendingChannels.get(requestId)?.abort();
        } else if (isTransportMessage(ev.data, requestId)) {
          // request, client message
          this.servicePortPostMessage(ev.data);
        } else if (isTransportStream(ev.data, requestId) && globalThis.__DEV__) {
          // request, client stream
          this.servicePortPostMessage(this.makeChannelStreamRequest(ev.data));
        } else {
          // something unsupported
          throw new ConnectError('Unsupported request from client', Code.Unimplemented);
        }
      } catch (cause) {
        this.clientPortPostError(cause, requestId);
      }
    } else {
      this.clientPortPostError(new ConnectError('Unknown item from client', Code.Unknown));
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
          this.clientPortPostMessage(msg);
        } else if (isTransportMessage(msg)) {
          // response, server message
          this.clientPortPostMessage(msg);
        } else if (isTransportInitChannel(msg)) {
          // response, server stream
          this.clientPortPostMessage(this.acceptChannelStreamResponse(msg));
        } else {
          // something unsupported
          throw ConnectError.from('Unsupported response from service', Code.Unimplemented);
        }
      } catch (failure) {
        this.clientPortPostError(failure, requestId);
      }
    } else {
      this.clientPortPostError(ConnectError.from('Unknown item from service'), undefined);
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
  private acceptChannelStreamResponse = ({
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
  private makeChannelStreamRequest = ({
    requestId,
    stream,
  }: TransportStream): TransportInitChannel => {
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
          // stream failure is handled in-band, but this might cover unknowns.
          .catch((cause: unknown) => this.clientPortPostError(cause, requestId))
          // port closure is handled in-band, but this should prevent leaks.
          .finally(() => sinkPort.disconnect());
      }
    };

    chrome.runtime.onConnect.addListener(sinkListener);
    AbortSignal.any([ac.signal, AbortSignal.timeout(60_000)]).addEventListener('abort', () => {
      this.pendingChannels.delete(requestId);
      chrome.runtime.onConnect.removeListener(sinkListener);
    });

    return { requestId, channel };
  };
}
