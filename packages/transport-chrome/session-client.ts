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
  isTransportEvent,
  isTransportMessage,
  isTransportStream,
  TransportStream,
} from '@penumbra-zone/transport-dom/src/messages';
import { ChannelLabel, nameConnection } from './channel-names';
import { isTransportInitChannel, TransportInitChannel } from './message';
import { PortStreamSink, PortStreamSource } from './stream';

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
    const { port1, port2 } = new MessageChannel();
    CRSessionClient.singleton ??= new CRSessionClient(prefix, port1);
    return port2;
  }

  private disconnect = () => {
    this.clientPort.removeEventListener('message', this.clientListener);
    this.clientPort.addEventListener('message', (ev: MessageEvent<unknown>) => {
      if (isTransportEvent(ev.data)) {
        const { requestId } = ev.data;
        this.clientPort.postMessage({ requestId, error: 'Connection closed' });
      }
    });
    this.clientPort.postMessage({ error: { code: 'unavailable', message: 'Connection closed' } });
  };

  private clientListener = (ev: MessageEvent<unknown>) => {
    try {
      if (isTransportMessage(ev.data)) this.servicePort.postMessage(ev.data);
      else if (isTransportStream(ev.data))
        this.servicePort.postMessage(this.requestChannelStream(ev.data));
      else console.warn('Unknown item from client', ev.data);
    } catch (e) {
      this.clientPort.postMessage({ error: { code: 'unknown', message: String(e) } });
    }
  };

  private serviceListener = (m: unknown) => {
    try {
      if (isTransportError(m) || isTransportMessage(m)) this.clientPort.postMessage(m);
      else if (isTransportInitChannel(m))
        this.clientPort.postMessage(...this.acceptChannelStreamResponse(m));
      else console.warn('Unknown item from service', m);
    } catch (e) {
      this.clientPort.postMessage({ error: { code: 'unknown', message: String(e) } });
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
      stream.pipeTo(new WritableStream(new PortStreamSink(p))).catch(() => null);
    };
    chrome.runtime.onConnect.addListener(sinkListener);
    return { requestId, channel } satisfies TransportInitChannel;
  };
}
