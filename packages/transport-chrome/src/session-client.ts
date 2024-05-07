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
import { Code, ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';

export class CRSessionClient {
  private static perExtension = new Map<string, CRSessionClient>();
  private servicePort: chrome.runtime.Port;
  private clientPort: MessagePort;
  private givePort: MessagePort;
  private connectionState?: boolean;

  private constructor(
    private prefix: string,
    private external: boolean,
  ) {
    const connectInfo = { name: nameConnection(prefix, ChannelLabel.TRANSPORT) };
    this.servicePort = this.external
      ? chrome.runtime.connect(prefix, connectInfo)
      : chrome.runtime.connect(connectInfo);

    this.servicePort.onDisconnect.addListener(this.disconnect);
    this.servicePort.onMessage.addListener(this.serviceListener);

    const { port1, port2 } = new MessageChannel();
    this.clientPort = port1;
    this.givePort = port2;

    this.clientPort.addEventListener('message', this.clientListener);
    this.clientPort.start();
  }

  /**
   * Establishes a new connection from this document to the extension.
   *
   * @param prefix a string containing no spaces
   * @returns a `MessagePort` that can be provided to DOM channel transports
   */
  public static init(prefix: string, external = false) {
    if (external ? CRSessionClient.perExtension.has(prefix) : CRSessionClient.perExtension.size)
      throw new Error('Already constructed');
    const session = new CRSessionClient(prefix, external);
    CRSessionClient.perExtension.set(prefix, session);

    return session;
  }

  public get port() {
    return this.givePort;
  }

  public get connected() {
    return this.connectionState;
  }

  private disconnect = () => {
    this.connectionState = false;
    this.clientPort.removeEventListener('message', this.clientListener);
    this.clientPort.postMessage({
      error: errorToJson(new ConnectError('Connection closed', Code.Unavailable), undefined),
    });
    this.clientPort.close();
  };

  private clientListener = (ev: MessageEvent<unknown>) => {
    try {
      if (isTransportMessage(ev.data)) this.servicePort.postMessage(ev.data);
      else if (isTransportStream(ev.data))
        this.servicePort.postMessage(this.requestChannelStream(ev.data));
      else console.warn('Unknown item from client', ev.data);
    } catch (e) {
      this.clientPort.postMessage({ error: errorToJson(ConnectError.from(e), undefined) });
    }
  };

  private serviceListener = (m: unknown) => {
    this.connectionState ??= true;
    try {
      if (isTransportError(m) || isTransportMessage(m)) this.clientPort.postMessage(m);
      else if (isTransportInitChannel(m))
        this.clientPort.postMessage(...this.acceptChannelStreamResponse(m));
      else console.warn('Unknown item from service', m);
    } catch (e) {
      this.clientPort.postMessage({ error: errorToJson(ConnectError.from(e), undefined) });
    }
  };

  private acceptChannelStreamResponse = ({ requestId, channel: name }: TransportInitChannel) => {
    const stream = new ReadableStream(
      new PortStreamSource(
        this.external
          ? chrome.runtime.connect(this.prefix, { name })
          : chrome.runtime.connect({ name }),
      ),
    );
    return [{ requestId, stream }, [stream]] satisfies [TransportStream, [Transferable]];
  };

  private requestChannelStream = ({ requestId, stream }: TransportStream) => {
    const channel = nameConnection(this.prefix, ChannelLabel.STREAM);
    const sinkListener = (p: chrome.runtime.Port) => {
      if (p.name !== channel) return;
      if (this.external) chrome.runtime.onConnectExternal.removeListener(sinkListener);
      else chrome.runtime.onConnect.removeListener(sinkListener);
      void stream.pipeTo(new WritableStream(new PortStreamSink(p))).catch(() => null);
    };
    if (this.external) chrome.runtime.onConnectExternal.addListener(sinkListener);
    else chrome.runtime.onConnect.addListener(sinkListener);
    return { requestId, channel } satisfies TransportInitChannel;
  };
}
