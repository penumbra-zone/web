/**
 * CRSessionClient is a Chrome runtime session client: it handles channel
 * Transport client sessions in the Chrome runtime.  Intended for use as a
 * document singleton, in a content script.
 *
 * Simple handlers unconditionally forward messages back and forth. Chrome
 * runtime disconnect is detected and surfaced as an error.
 *
 * Only a basic same-window origin check and structural typing are performed.
 * Content scripts are ultimately untrusted, so services are responsible for
 * confirming legitimacy.
 *
 * A `ReadableStream` or `AsyncIterable` cannot cross the runtime, so streaming
 * methods sink/source a dedicated `chrome.runtime.Port` at this boundary.
 */

import { Code, ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  isTransportAbort,
  isTransportError,
  isTransportMessage,
  isTransportStream,
  TransportStream,
} from '@penumbra-zone/transport-dom/messages';
import { ChannelLabel, nameConnection } from './channel-names.js';
import { isTransportInitChannel, TransportInitChannel } from './message.js';
import { PortStreamSink, PortStreamSource } from './stream.js';

const getRequestId = (item?: unknown): string | undefined =>
  item != null &&
  typeof item === 'object' &&
  'requestId' in item &&
  typeof item.requestId === 'string'
    ? item.requestId
    : undefined;

export class CRSessionClient {
  private static singleton?: CRSessionClient;
  private servicePort: chrome.runtime.Port;
  private clientPort: MessagePort;
  public inputPort: MessagePort;

  private constructor(private prefix: string) {
    if (CRSessionClient.singleton) {
      throw new Error('Already constructed');
    }

    const { port1, port2 } = new MessageChannel();
    this.clientPort = port1;
    this.inputPort = port2;

    this.servicePort = chrome.runtime.connect({
      includeTlsChannelId: true,
      name: nameConnection(prefix, ChannelLabel.TRANSPORT),
    });

    this.servicePort.onMessage.addListener(this.serviceListener);
    this.servicePort.onDisconnect.addListener(this.disconnect);
    this.clientPort.addEventListener('message', this.clientListener);
    this.clientPort.start();
  }

  /**
   * Establishes a new connection from this document to the extension.
   *
   * @param prefix a string containing no spaces
   * @returns a `MessagePort` that can be provided to DOM channel transports
   */
  public static init(prefix: string): MessagePort {
    CRSessionClient.singleton ??= new CRSessionClient(prefix);
    return CRSessionClient.singleton.inputPort;
  }

  private disconnect = () => {
    this.clientPort.removeEventListener('message', this.clientListener);
    this.clientPort.postMessage(false);
    this.clientPort.close();
    this.servicePort.disconnect();
    CRSessionClient.singleton = undefined;
  };

  private clientListener = (ev: MessageEvent<unknown>) => {
    try {
      if (ev.data === false) {
        this.disconnect();
      } else if (isTransportAbort(ev.data)) {
        this.servicePort.postMessage(ev.data);
      } else if (isTransportMessage(ev.data)) {
        this.servicePort.postMessage(ev.data);
      } else if (isTransportStream(ev.data)) {
        this.servicePort.postMessage(this.makeChannelStreamRequest(ev.data));
      } else {
        throw ConnectError.from(
          new TypeError('Unknown item from client', { cause: ev.data }),
          Code.Unimplemented,
        );
      }
    } catch (e) {
      this.clientPort.postMessage({
        requestId: getRequestId(ev.data),
        error: errorToJson(ConnectError.from(e), undefined),
      });
    }
  };

  private serviceListener = (msg: unknown) => {
    try {
      if (isTransportError(msg)) {
        this.clientPort.postMessage(msg);
      } else if (isTransportMessage(msg)) {
        this.clientPort.postMessage(msg);
      } else if (isTransportInitChannel(msg)) {
        this.clientPort.postMessage(...this.acceptChannelStreamResponse(msg));
      } else {
        throw new TypeError('Unknown item from service', { cause: msg });
      }
    } catch (e) {
      this.clientPort.postMessage({
        requestId: getRequestId(msg),
        error: errorToJson(ConnectError.from(e), undefined),
      });
    }
  };

  private acceptChannelStreamResponse = ({ requestId, channel: name }: TransportInitChannel) => {
    const stream = new ReadableStream(new PortStreamSource(chrome.runtime.connect({ name })));
    return [{ requestId, stream }, [stream]] satisfies [TransportStream, [Transferable]];
  };

  private makeChannelStreamRequest = ({ requestId, stream }: TransportStream) => {
    const channel = nameConnection(this.prefix, ChannelLabel.STREAM);
    const sinkListener = (p: chrome.runtime.Port) => {
      if (p.name !== channel) {
        return;
      }
      chrome.runtime.onConnect.removeListener(sinkListener);
      void stream.pipeTo(new WritableStream(new PortStreamSink(p))).catch(() => null);
    };
    chrome.runtime.onConnect.addListener(sinkListener);
    return { requestId, channel } satisfies TransportInitChannel;
  };
}
