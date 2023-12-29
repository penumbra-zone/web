import { ChromeRuntimeStreamSource } from './stream';

import {
  TransportMessage,
  TransportStream,
  InitChannelClientData,
  isTransportData,
  isTransportMessage,
  isTransportInitChannel,
  nameChannel,
  ChannelClientLabel,
  isClientInitMessage,
  isTransportState,
  TransportState,
  isTransportError,
  TransportInitChannel,
} from '../types';

interface ClientConnection {
  clientPort: MessagePort;
  servicePort: chrome.runtime.Port;
  clientListener: (ev: MessageEvent) => void;
  serviceListener: Parameters<chrome.runtime.PortMessageEvent['addListener']>[0];
}

/**
 * Use the init method to instantiate.
 *
 * Only for use as a page-level singleton by an extension script.  Manages
 * client-side connections of all event transports in the document.
 *
 * Each client init unconditionally opens a dedicated channel.  Simple handlers
 * unconditionally forward messages back and forth.
 *
 * Only a basic origin check and structural typing are performed. Content
 * scripts are ultimately untrusted, so services are responsible for confirming
 * legitimacy.
 *
 * A ReadableStream or AsyncIterable cannot transfer across the chrome runtime
 * boundary, so streams are encapsulated into dedicated channels at this
 * location, with some basic sequencing.
 *
 */

export class ClientConnectionManager {
  private static singleton: ClientConnectionManager | undefined;
  private static attached: MessagePort | undefined;
  private connections = new Map<ReturnType<typeof crypto.randomUUID>, ClientConnection>();

  /**
   * Init method for the singleton.
   *
   * @param label ChannelClientLabel to be applied to every connection
   * @param initPort MessagePort to use. Only for content scripts.
   */
  static init(label: ChannelClientLabel.Extension): MessagePort;
  static init(label: ChannelClientLabel.ContentScript, initPort: MessagePort): undefined;
  static init(label: ChannelClientLabel, initPort?: MessagePort) {
    if (label === ChannelClientLabel.Extension && !initPort) {
      const { port1, port2 } = new MessageChannel();
      ClientConnectionManager.singleton ??= new ClientConnectionManager(label, port1);
      ClientConnectionManager.attached ??= port2;
    } else if (label == ChannelClientLabel.ContentScript && initPort) {
      ClientConnectionManager.singleton ??= new ClientConnectionManager(label, initPort);
      ClientConnectionManager.attached ??= undefined;
      if (ClientConnectionManager.attached) throw Error('Somehow already attached');
    } else throw Error('Invalid arguments');
    return ClientConnectionManager.attached;
  }

  private constructor(
    protected label: ChannelClientLabel,
    private initPort: MessagePort,
  ) {
    if (ClientConnectionManager.singleton) throw Error('Already constructed');
    this.initPort.addEventListener('message', evt => {
      if (isClientInitMessage(evt)) this.initConnection(evt.data);
    });
    this.initPort.start();
  }

  /**
   * Requests a new connection to a service in the extension. Any untrusted page
   * may attempt to connect.
   *
   * All further communication with a client happens over the page-provided
   * clientPort.  All communication with the extension happens over the
   * chrome.runtime.Port initialized here.
   *
   * @param clientPort MessagePort provided by the page-controlled client
   * @param serviceTypeName requested fully-qualified service typename
   */
  private initConnection({ port: clientPort }: InitChannelClientData) {
    const [clientName, { uuid: clientId }] = nameChannel(this.label);
    const servicePort = chrome.runtime.connect({ includeTlsChannelId: true, name: clientName });

    /**
     * Client-specific message handler. Listens for messages on the
     * page-provided client channel.  Messages are forwarded to the service port
     * without much validation.
     *
     * @param ev may be any message transmitted by any untrusted page or other
     * untrusted script with access to the page-provided message channel
     */
    const clientListener = (ev: MessageEvent<TransportMessage | TransportStream>) => {
      try {
        if (!isTransportData(ev.data)) throw Error('Unknown transport from client');
        else if (isTransportMessage(ev.data)) servicePort.postMessage(ev.data);
        else throw Error('Unimplemented request kind');
      } catch (error) {
        console.error('Error in client listener', error);
        clientPort.postMessage({ error });
      }
    };

    const acceptChannelStream = (ev: TransportInitChannel): TransportStream => {
      const { requestId, channel: subName } = ev;
      const sourcePort = chrome.runtime.connect({ includeTlsChannelId: true, name: subName });
      const stream = new ReadableStream(new ChromeRuntimeStreamSource(sourcePort));
      return { requestId, stream };
    };

    /**
     * Client-specific message handler, listening for return messages from the
     * extension.  Messages do not necessarily represent a response to a
     * request.  Messages are forwarded to the page-provided client channel
     * without much validation.
     *
     * The extension may provide a new channel name, to be used as a source for a
     * stream that gets transferred to the client.
     *
     * TODO: response origin?
     *
     * @param ev any message transmitted on the client-specific service channel
     * by any part of the extension runtime, hopefully just the service router
     */
    const serviceListener: Parameters<chrome.runtime.PortMessageEvent['addListener']>[0] = (
      ev: unknown,
    ) => {
      try {
        if (isTransportState(ev)) {
          clientPort.postMessage(ev);
          if (!ev.connected) this.endConnection(clientId);
        } else if (isTransportError(ev)) clientPort.postMessage(ev);
        else if (isTransportMessage(ev)) clientPort.postMessage(ev);
        else if (isTransportInitChannel(ev)) {
          const sub = acceptChannelStream(ev);
          clientPort.postMessage(sub, [sub.stream]);
        } else throw Error('Unexpected transport from service');
      } catch (error) {
        console.error('Error in service listener', error, ev);
        clientPort.postMessage({ error: String(error) });
      }
    };

    this.connections.set(clientId, {
      clientPort,
      servicePort,
      clientListener,
      serviceListener,
    });

    servicePort.onMessage.addListener(serviceListener);
    servicePort.onDisconnect.addListener(() => this.endConnection(clientId));

    clientPort.addEventListener('message', clientListener);
    clientPort.start();
  }

  /**
   * Tears down a single connection
   *
   * Closing the service port will generate a disconnect event on the other end,
   * but closing the client port will not.
   *
   * @param clientId number identifying the connection
   */
  private endConnection(clientId: ReturnType<typeof crypto.randomUUID>) {
    const { clientPort, servicePort } = this.connections.get(clientId)!;
    this.connections.delete(clientId);
    try {
      clientPort.postMessage({ connected: false } satisfies TransportState);
      clientPort.close();
    } finally {
      servicePort.disconnect();
    }
  }
}
