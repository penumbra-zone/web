import {
  ChannelConfig,
  ChannelClientLabel,
  nameChannel,
  parseConnectionName,
  ChannelSubLabel,
  isTransportMessage,
  TransportInitChannel,
  TransportMessage,
  TransportError,
  TransportStream,
  TransportState,
} from '../types';

import { JsonValue } from '@bufbuild/protobuf';
import { ChromeRuntimeStreamSink } from './stream';
import { isDisconnectedPortError } from './errors';
import { ConnectError } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';

interface BackgroundConnection {
  type: ChannelClientLabel;
  port: chrome.runtime.Port;
  sender: chrome.runtime.MessageSender;
  tab: undefined | chrome.tabs.Tab;
  streams: Map<string, AbortController>;
  documentId: string | undefined;
  tlsChannelId: string | undefined;
}

type UnconditionalServiceAccessFn = (
  x: JsonValue,
) => Promise<JsonValue | ReadableStream<JsonValue>>;

type UnconditionalServiceAccess = Record<string, UnconditionalServiceAccessFn>;

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

  static init = (usa: UnconditionalServiceAccess) => {
    BackgroundConnectionManager.singleton ??= new BackgroundConnectionManager(usa);
  };

  private constructor(private unconditionalServiceAccess: UnconditionalServiceAccess) {
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
    if (sender?.origin && (name.startsWith('Extension') || name.startsWith('ContentScript'))) {
      const { origin: senderOrigin, tlsChannelId, documentId, tab } = sender;
      const channelConfig = parseConnectionName<typeof name, ChannelConfig>(name);
      const {
        label: clientType,
        uuid: clientId,
        origin: claimedOrigin,
        typeName: serviceName,
      } = channelConfig ?? ({} as ChannelConfig);
      const originConnections =
        this.connections.get(senderOrigin) ??
        this.connections.set(senderOrigin, new Map()).get(senderOrigin);
      const serviceEntry = this.unconditionalServiceAccess[serviceName!];

      try {
        if (!channelConfig) throw Error(`Invalid channel ${name}`);
        if (!(clientType in ChannelClientLabel)) throw Error(`Invalid client type ${clientType}`);
        if (!serviceName) throw Error(`Missing service name`);
        if (senderOrigin !== claimedOrigin)
          throw Error(`Origin mismatch ${senderOrigin} claimed ${claimedOrigin}`);
        if (originConnections?.has(clientId)) throw Error(`Client id collision ${clientId}`);
        if (!serviceEntry) throw Error(`Unknown ${serviceName} requested by client`);
      } catch (error) {
        console.error('Connection rejected', error);
        clientPort.postMessage({ connected: false, reason: String(error) });
        clientPort.disconnect();
        return;
      }

      const connection: BackgroundConnection = {
        tab,
        type: clientType as ChannelClientLabel,
        port: clientPort,
        sender,
        streams: new Map<string, AbortController>(),
        tlsChannelId,
        documentId,
      };

      /**
       * This method is used to manage a sub-channel, encapsulating a response
       * stream. A TransportInitChannel representing the channel is returned for
       * transport to the client. The client should respond by opening a
       * connection bearing this name.
       *
       * @param subStream ReadableStream to be transmitted via sub-channel
       */
      const initSubChannel = ({ requestId, stream }: TransportStream): TransportInitChannel => {
        const [channel] = nameChannel(ChannelSubLabel.ServerStream);
        const acont = new AbortController();

        /**
         * This is the generated connection listener. It checks for our
         * generated subName, and any connection not bearing the name is
         * ignored.  The sink transmits the stream piecewise in the channel.
         *
         * @param subPort chrome.runtime.Port, initiated by any new runtime connection
         */
        const subListener = (subPort: chrome.runtime.Port) => {
          if (subPort.name !== channel) return;
          chrome.runtime.onConnect.removeListener(subListener);
          connection.streams.set(channel, acont);
          subPort.onDisconnect.addListener(() => acont.abort(channel));
          void stream
            .pipeTo(new WritableStream(new ChromeRuntimeStreamSink(subPort)), {
              signal: acont.signal,
            })
            .catch((error: unknown) => {
              if (error !== channel) {
                // TODO: handling errors in this promise chain is problematic.
                // we're in a callback, and can't reliably answer the requester.
                console.error('Error in subchannel', error);
                clientPort.postMessage({
                  error: Object.assign(errorToJson(ConnectError.from(error), undefined), {
                    requestId,
                    channel,
                  }),
                });
              }
            })
            .finally(() => {
              connection.streams.delete(channel);
              subPort.disconnect();
            });
        };
        chrome.runtime.onConnect.addListener(subListener);

        // TODO: revisit this
        /*
        setTimeout(() => {
          if (chrome.runtime.onConnect.hasListener(subListener)) {
            // handler still hasn't activated, or it would be gone
            chrome.runtime.onConnect.removeListener(subListener);
            acont.abort('Timed out subchannel activation');
          }
        }, 1000);
        */

        return { requestId, channel };
      };

      /**
       * This method handles incoming transport requests.
       *
       * @param extensionRequest anything received on the transport
       * @param transPort the clientPort as available in this handler
       */
      const transportListener = (transportRequest: unknown, transPort: chrome.runtime.Port) => {
        if (!isTransportMessage(transportRequest)) throw Error('Unknown item in transport');

        const { requestId, message: request } = transportRequest;

        /*
        const serviceTimeout = new Promise<void>((_, reject) =>
          setTimeout(reject, 1000, 'Timed out service request'),
        );

        const transportResponse = Promise.race([serviceEntry(request), serviceTimeout])
        */

        const transportResponse = serviceEntry(request)
          .then(response =>
            response instanceof ReadableStream
              ? initSubChannel({ requestId, stream: response })
              : ({ requestId, message: response } as TransportMessage),
          )
          .catch(
            (error: unknown) =>
              ({
                requestId,
                error: errorToJson(ConnectError.from(error), undefined),
              }) as TransportError,
          );

        transportResponse
          .then(extResponse => transPort.postMessage(extResponse))
          .catch(e => {
            // TODO: abort requests
            if (!isDisconnectedPortError(e)) throw e;
          });
      };

      // create connection record
      originConnections?.set(clientId, connection);

      clientPort.onDisconnect.addListener(() => this.disconnectClient(senderOrigin, clientId));
      clientPort.onMessage.addListener((i: unknown, p) => {
        try {
          transportListener(i, p);
        } catch (error) {
          console.error('Failed to respond', i, error);
          clientPort.postMessage({ error: errorToJson(ConnectError.from(error), undefined) });
        }
      });

      // finally acknowledge connection
      clientPort.postMessage({ connected: true } as TransportState);
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
