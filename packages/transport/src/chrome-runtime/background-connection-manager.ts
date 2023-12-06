import {
  ChannelConfig,
  ChannelClientLabel,
  nameSubConnection,
  parseConnectionName,
  ChannelSubLabel,
  isTransportMessage,
} from '../types';

import { JsonValue } from '@bufbuild/protobuf';
import { ChromeRuntimeStreamSink } from './stream';

interface OriginRegistry {
  known(origin: string): Promise<boolean>;
  // TODO
  //services(origin: string): Promise<Record<string, false | ChromeRuntimeAdapterOptions>>;
  services(
    origin: string,
  ): Promise<Record<string, (x: JsonValue) => Promise<JsonValue> | ReadableStream<JsonValue>>>;
}

interface BackgroundConnection {
  type: ChannelClientLabel;
  port: chrome.runtime.Port;
  sender: chrome.runtime.MessageSender;
  tab: undefined | chrome.tabs.Tab;
  streams: Map<string, AbortController>;
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
  private connections = new Map<
    string, // origin URI
    Map<ReturnType<typeof crypto.randomUUID>, BackgroundConnection>
  >();

  static init = (origins: OriginRegistry) => {
    BackgroundConnectionManager.singleton ??= new BackgroundConnectionManager(origins);
  };

  private constructor(private origins: OriginRegistry) {
    if (BackgroundConnectionManager.singleton) throw Error('Already constructed');
    chrome.runtime.onConnect.addListener(port => void this.connectionListener(port));
  }

  /**
   * This handler is called when a new connection is opened from any document
   * with access to the chrome runtime.  Here we make an effort to identify
   * the origin and the requested service. If we are willing to provide this
   * service to the origin, a service-specific handler is connected to the
   * port.
   *
   * TODO: this only supports connections from browser tabs, or other scripts
   * inside this extension. is this appropriate, or should we support apps,
   * external processes, or other extensions?
   *
   * @param port opened by any connecting document, preferably an injected
   * content script or other extension script
   */
  private connectionListener = async (port: chrome.runtime.Port) => {
    const { name, sender } = port;
    if (!sender) return;
    const { origin: portOrigin, documentId, frameId } = sender;
    if (
      // TODO: revisit these conditions
      documentId &&
      portOrigin && // known origin
      //tlsChannelId && // TODO: require TLS
      frameId === 0 && // no iframes
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
      const serviceEntry = provision[serviceName];
      if (!serviceEntry) {
        port.disconnect();
        throw new Error('Unknown service');
      }

      const connection = {
        type: clientType as ChannelClientLabel,
        port,
        sender,
        streams: new Map<string, AbortController>(),
      } as BackgroundConnection;

      const subHandler = (subStream: ReadableStream<JsonValue>, subName: string) => {
        return (sub: chrome.runtime.Port) => {
          if (sub.name !== subName) return;
          const acont = new AbortController();
          connection.streams.set(subName, acont);
          port.onDisconnect.addListener(() => acont.abort(subName));
          void subStream
            .pipeTo(new WritableStream(new ChromeRuntimeStreamSink(sub)), { signal: acont.signal })
            .catch(e => {
              if (e !== subName) throw e;
            })
            .finally(() => {
              connection.streams.delete(subName);
              sub.disconnect();
              void subStream.cancel();
            });
        };
      };

      const transportListener = async (transported: unknown, transPort: chrome.runtime.Port) => {
        // TODO: unary, serverstream only for now
        if (!isTransportMessage(transported)) return;
        const { requestId, message: request } = transported;
        const response = await serviceEntry(request);
        if (response instanceof ReadableStream) {
          const responseChannel = nameSubConnection(ChannelSubLabel.ServerStream);
          chrome.runtime.onConnect.addListener(subHandler(response, String(responseChannel)));
          transPort.postMessage({ requestId, channel: responseChannel });
        } else transPort.postMessage({ requestId, message: response });
      };

      originConnections?.set(clientId, connection);

      port.onDisconnect.addListener(() => this.disconnectClient(portOrigin, clientId));
      port.onMessage.addListener((m, p) => void transportListener(m, p));
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

    connection.streams.forEach((acont, subName) => acont.abort(subName));
    connection.port.disconnect();
  };
}
