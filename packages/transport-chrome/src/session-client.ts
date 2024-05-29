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

import {
  isTransportError,
  isTransportMessage,
  isTransportStream,
  TransportStream,
} from '@penumbra-zone/transport-dom/messages';
import { ChannelLabel, nameConnection } from './channel-names';
import { isTransportInitChannel, TransportInitChannel } from './message';
import { PortStreamSink, PortStreamSource } from './stream';

const localErrorJson = (e: unknown, m?: unknown) =>
  e instanceof Error
    ? {
        message: e.message,
        details: [
          {
            type: e.name,
            value: e.cause,
          },
          m,
        ],
      }
    : {
        message: String(e),
        details: [
          {
            type: String(
              typeof e === 'function'
                ? e.name
                : typeof e === 'object'
                  ? (Object.getPrototypeOf(e) as unknown)?.constructor?.name ?? String(e)
                  : typeof e,
            ),
            value: e,
          },
          m,
        ],
      };

export class CRSessionClient {
  private static singleton?: CRSessionClient;
  private servicePort: chrome.runtime.Port;

  private constructor(
    private prefix: string,
    private clientPort: MessagePort,
  ) {
    if (CRSessionClient.singleton) throw new Error('Already constructed');

    this.servicePort = chrome.runtime.connect({
      includeTlsChannelId: true,
      name: nameConnection(prefix, ChannelLabel.TRANSPORT),
    });

    this.servicePort.onMessage.addListener(this.serviceListener);
    this.servicePort.onDisconnect.addListener(this.disconnectClient);
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
    const { port1, port2 } = new MessageChannel();
    CRSessionClient.singleton ??= new CRSessionClient(prefix, port1);
    return port2;
  }

  private disconnectClient = () => {
    this.clientPort.removeEventListener('message', this.clientListener);
    this.clientPort.postMessage(false);
    this.clientPort.close();
  };

  private disconnectService = () => {
    this.servicePort.disconnect();
  };

  private clientListener = (ev: MessageEvent<unknown>) => {
    try {
      if (ev.data === false) this.disconnectService();
      else if (isTransportMessage(ev.data)) this.servicePort.postMessage(ev.data);
      else if (isTransportStream(ev.data))
        this.servicePort.postMessage(this.requestChannelStream(ev.data));
      else console.warn('Unknown item from client', ev.data);
    } catch (e) {
      this.clientPort.postMessage({ error: localErrorJson(e, ev.data) });
    }
  };

  private serviceListener = (m: unknown) => {
    try {
      if (m === true) this.clientPort.postMessage(true);
      else if (isTransportError(m) || isTransportMessage(m)) this.clientPort.postMessage(m);
      else if (isTransportInitChannel(m))
        this.clientPort.postMessage(...this.acceptChannelStreamResponse(m));
      else console.warn('Unknown item from service', m);
    } catch (e) {
      this.clientPort.postMessage({ error: localErrorJson(e, m) });
    }
  };

  private acceptChannelStreamResponse = ({ requestId, channel: name }: TransportInitChannel) => {
    const stream = new ReadableStream(new PortStreamSource(chrome.runtime.connect({ name })));
    return [{ requestId, stream }, [stream]] satisfies [TransportStream, [Transferable]];
  };

  private requestChannelStream = ({ requestId, stream }: TransportStream) => {
    const channel = nameConnection(this.prefix, ChannelLabel.STREAM);
    const sinkListener = (p: chrome.runtime.Port) => {
      if (p.name !== channel) return;
      chrome.runtime.onConnect.removeListener(sinkListener);
      void stream.pipeTo(new WritableStream(new PortStreamSink(p))).catch(() => null);
    };
    chrome.runtime.onConnect.addListener(sinkListener);
    return { requestId, channel } satisfies TransportInitChannel;
  };
}
