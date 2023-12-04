import {
  ChannelConfig,
  ChannelClientLabel,
  nameSubConnection,
  parseConnectionName,
  ChannelSubLabel,
  TransportMessage,
} from '../types';

import { JsonValue } from '@bufbuild/protobuf';
import { ChromeRuntimeStreamSink } from './stream';

interface OriginRegistry {
  known(origin: string): Promise<boolean>;
  // TODO
  //services(origin: string): Promise<Record<string, false | ChromeRuntimeAdapterOptions>>;
  services(origin: string): Promise<Record<string, (x: JsonValue) => Promise<JsonValue>>>;
}

interface BackgroundConnection {
  type: ChannelClientLabel;
  service: string;
  port: chrome.runtime.Port;
  sender: chrome.runtime.MessageSender;
  //transportListener: Parameters<chrome.runtime.PortMessageEvent['addListener']>[0];
  transportListener: (m: unknown, p: chrome.runtime.Port) => void;
  tab: undefined | chrome.tabs.Tab;
  streams: chrome.runtime.Port[];
  documentId: string;
  tlsChannelId: string;
}

/**
 * Only for use as an extension-level singleton in the extension's main
 * background worker.  This should be the only location where the extension
 * accepts RPC, accepts connections, or otherwise interacts with external
 * documents.
 *
 * Any untrusted script may attempt a connection here. This manager is
 * responsible for checking origin authentication.
 *
 * @param origins a registry of known origins and permitted services
 */
export class BackgroundConnectionManager {
  private static singleton: BackgroundConnectionManager | undefined;
  private static attached = false;
  private connections = new Map<
    string, // origin URI
    Map<ReturnType<typeof crypto.randomUUID>, BackgroundConnection>
  >();

  static init = (origins: OriginRegistry) => {
    BackgroundConnectionManager.singleton ??= new BackgroundConnectionManager(origins);
  };

  private constructor(private origins: OriginRegistry) {
    if (BackgroundConnectionManager.singleton) throw Error('Already constructed');
    if (BackgroundConnectionManager.attached) throw Error('Already attached');
    chrome.runtime.onConnect.addListener(port => void this.connectionListener(port));
    BackgroundConnectionManager.attached = true;
  }

  /**
   * This handler is called when a new connection is opened from any document
   * with access to the chrome runtime.  Here we make an effort to identify
   * the origin and the requested service. If we are willing to provide this
   * service to the origin, a service-specific handler is connected to the
   * port.
   *
   * TODO: this only supports connections from browser tabs. is this
   * appropriate, or should we support apps, external processes, or other
   * extensions?
   *
   * @param port opened by any connecting document, preferably an injected
   * content script
   */
  private connectionListener = async (port: chrome.runtime.Port) => {
    const { name, sender } = port;
    if (!sender) return;
    const { origin: portOrigin, documentId, frameId, tlsChannelId, tab } = sender;
    if (
      // TODO: revisit these conditions
      documentId &&
      portOrigin && // known origin
      //tlsChannelId && // require TLS
      frameId === 0 && // no iframes
      //tab?.id && // document in tab
      (name.startsWith('Extension') || name.startsWith('ContentScript')) &&
      (await this.origins.known(portOrigin))
    ) {
      const channelConfig = parseConnectionName<typeof name, ChannelConfig>(name);
      if (!channelConfig) throw Error(`Invalid channel ${name}`);
      const {
        label: clientType,
        uuid: clientId,
        origin: claimedOrigin,
        typeName: serviceName,
      } = channelConfig;
      if (!serviceName) throw Error(`Missing service name`);
      if (portOrigin !== claimedOrigin) throw Error('Origin mismatch');
      const originConnections =
        this.connections.get(portOrigin) ??
        this.connections.set(portOrigin, new Map()).get(portOrigin);
      if (originConnections?.has(clientId)) throw Error('Client id collision');

      const provision = await this.origins.services(portOrigin);

      if (!(serviceName in provision)) {
        port.disconnect();
        return;
      }

      const subHandler = // call to generate handler
        (rs: ReadableStream<JsonValue>, n: string) => {
          // TODO: remove handler after stream finishes
          return (sub: chrome.runtime.Port) => {
            if (sub.name !== n) return;
            const chromeSink = new ChromeRuntimeStreamSink(sub);
            void rs.pipeTo(new WritableStream(chromeSink));
            // TODO: sub.disconnect()?
          };
        };

      /* temporary entry for old router */
      const serviceEntry = (serviceName in provision && provision[serviceName])! as (
        x: JsonValue,
      ) => Promise<JsonValue | ReadableStream<JsonValue>>;

      const transportListener = (m: unknown, p: chrome.runtime.Port) => {
        const { requestId, message: request } = m as TransportMessage;
        void serviceEntry(request).then(response => {
          if (response instanceof ReadableStream) {
            const responseChannel = nameSubConnection(ChannelSubLabel.ServerStream);
            chrome.runtime.onConnect.addListener(subHandler(response, String(responseChannel)));
            p.postMessage({ requestId, channel: responseChannel });
          } else p.postMessage({ requestId, message: response });
        });
      };
      /* end temporary entry for old router */

      const connection: BackgroundConnection = {
        type: clientType as ChannelClientLabel,
        service: serviceName,
        port,
        sender,
        transportListener,
        documentId,
        tlsChannelId: tlsChannelId ?? '',
        tab,
        streams: new Array<chrome.runtime.Port>(),
      };

      console.log('Connection established', claimedOrigin, clientId, connection);
      originConnections?.set(clientId, connection);

      port.onDisconnect.addListener(() => this.disconnectClient(portOrigin, clientId));
      port.onMessage.addListener(transportListener);
    }
  };

  /**
   * Tears down a single client connection.
   *
   * @param portOrigin string identifying the expected port origin
   * @param clientId identifying the specific client
   */
  private disconnectClient = (
    portOrigin: string,
    clientId: ReturnType<typeof crypto.randomUUID>,
  ) => {
    const originConnections = this.connections.get(portOrigin);
    const connection = originConnections?.get(clientId);
    if (!originConnections || !connection)
      throw Error(`Unknown disconnect ${portOrigin} ${clientId}`);

    originConnections.delete(clientId);
    if (!originConnections.size) this.connections.delete(portOrigin);

    connection.streams.map(s => s.disconnect()); // kill any active streams
    connection.port.disconnect();
  };
}
