import {
  ChannelConfig,
  ChannelClientLabel,
  nameChannel,
  parseConnectionName,
  ChannelSubLabel,
  isTransportMessage,
} from '../types';

import { JsonValue } from '@bufbuild/protobuf';
import { ChromeRuntimeStreamSink } from './stream';

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

  static init = (
    unconditionalAccessToAllTheServices: Record<string, (x: JsonValue) => Promise<JsonValue>>,
  ) => {
    BackgroundConnectionManager.singleton ??= new BackgroundConnectionManager(
      unconditionalAccessToAllTheServices,
    );
  };

  private constructor(
    private unconditionalAccessToAllTheServices: Record<
      string,
      (x: JsonValue) => Promise<JsonValue>
    >,
  ) {
    if (BackgroundConnectionManager.singleton) throw Error('Already constructed');
    chrome.runtime.onConnect.addListener(port => this.connectionListener(port));
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
   * @param clientPort opened by any connecting document, preferably an injected
   * content script or other extension script
   */
  private connectionListener = (clientPort: chrome.runtime.Port) => {
    const { name, sender } = clientPort;
    if (!sender) return;
    const { origin: portOrigin, documentId, frameId } = sender;
    if (
      // TODO: revisit these conditions
      documentId &&
      //tlsChannelId && // TODO: require TLS
      frameId === 0 && // no iframes
      (name.startsWith('Extension') || name.startsWith('ContentScript'))
      // no origin check happens at all
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

      const serviceEntry = this.unconditionalAccessToAllTheServices[serviceName];
      if (!serviceEntry) {
        clientPort.disconnect();
        throw new Error('Unknown service requested by client');
      }

      const connection = {
        type: clientType as ChannelClientLabel,
        port: clientPort,
        sender,
        streams: new Map<string, AbortController>(),
      } as BackgroundConnection;

      /**
       * This method is used to generate a handler for a connection request from
       * the client to open a sub-channel, as instructed by this connection
       * manager. The sub-channel encapsulates a response stream.
       *
       * @param subStream ReadableStream to be transmitted in a sub-channel
       * @param subName Name of a chrome.runtime.port representing a sub-channel
       */
      const subHandler = (subStream: ReadableStream<JsonValue>, subName: string) => {
        /**
         * This is the generated connection listener. It checks for a specified
         * name, which is transmitted to the client by the caller. Any
         * connecting port not identifying that name is ignored.
         *
         * @param subPort chrome.runtime.Port, initiated by any new runtime connection
         */
        const subConnectionListener = (subPort: chrome.runtime.Port) => {
          if (subPort.name !== subName) return;
          chrome.runtime.onConnect.removeListener(subConnectionListener);
          const acont = new AbortController();
          connection.streams.set(subName, acont);
          subPort.onDisconnect.addListener(() => acont.abort(subName));
          void subStream
            .pipeTo(new WritableStream(new ChromeRuntimeStreamSink(subPort)), {
              signal: acont.signal,
            })
            .catch(e => {
              if (e !== subName) throw e;
            })
            .finally(() => {
              connection.streams.delete(subName);
              subPort.disconnect();
              void subStream.cancel();
            });
        };
        return subConnectionListener;
      };

      /**
       * This method is attached as a listener to the clientPort, and handles
       * incoming transport events.
       *
       * @param transported anything received on the transport
       * @param transPort the clientPort as available in this handler
       */
      const transportListener = async (transported: unknown, transPort: chrome.runtime.Port) => {
        if (!isTransportMessage(transported)) return;
        const { requestId, message: request } = transported;

        // make the request.
        const response = await serviceEntry(request);

        if (response instanceof ReadableStream) {
          // if the response is a stream, handle it in a sub-channel
          const [subName] = nameChannel(ChannelSubLabel.ServerStream);
          chrome.runtime.onConnect.addListener(subHandler(response, subName));
          transPort.postMessage({ requestId, channel: subName });
        } else {
          // an individual response can be emitted directly
          transPort.postMessage({ requestId, message: response });
        }
      };

      originConnections?.set(clientId, connection);

      clientPort.onDisconnect.addListener(() => this.disconnectClient(portOrigin, clientId));
      clientPort.onMessage.addListener((m, p) => void transportListener(m, p));
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
