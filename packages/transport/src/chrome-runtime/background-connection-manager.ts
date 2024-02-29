import { ConnectError, Code as ConnectErrorCode } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  ChannelClientLabel,
  ChannelConfig,
  ChannelSubLabel,
  TransportError,
  TransportEvent,
  TransportInitChannel,
  TransportMessage,
  TransportState,
  TransportStream,
  isTransportMessage,
  nameChannel,
  parseConnectionName,
} from '../types';
import {
  isAbortSubOnDisconnect,
  isAbortSubParentDisconnect,
  isChromePortDisconnected,
} from './errors';
import { ChromeRuntimeStreamSink } from './stream';

import { ChromeRuntimeHandlerFn } from './adapter';

interface BackgroundConnection {
  type: ChannelClientLabel;
  port: chrome.runtime.Port;
  sender: chrome.runtime.MessageSender;
  tab: undefined | chrome.tabs.Tab;
  streams: Map<string, AbortController>;
  documentId: string | undefined;
  tlsChannelId: string | undefined;
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

  static init = (handler: ChromeRuntimeHandlerFn) => {
    BackgroundConnectionManager.singleton ??= new BackgroundConnectionManager(handler);
  };

  private constructor(private handler: ChromeRuntimeHandlerFn) {
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
    const sender = clientPort.sender;
    if (
      sender?.origin &&
      (clientPort.name.startsWith('Extension') || clientPort.name.startsWith('ContentScript'))
    ) {
      const { tlsChannelId, documentId, tab } = sender;
      const channelConfig = parseConnectionName<typeof clientPort.name, ChannelConfig>(
        clientPort.name,
      );
      const {
        label: clientType,
        uuid: clientId,
        origin: claimedOrigin,
      } = channelConfig ?? ({} as ChannelConfig);
      const originConnections =
        this.connections.get(sender.origin) ??
        this.connections.set(sender.origin, new Map()).get(sender.origin);

      try {
        if (!channelConfig || !(clientType in ChannelClientLabel)) {
          throw new ConnectError(
            `Invalid connection: ${clientPort.name}`,
            ConnectErrorCode.OutOfRange,
          );
        }
        if (sender.origin !== claimedOrigin) {
          throw new ConnectError(
            `Origin mismatch: ${sender.origin} claimed ${claimedOrigin}`,
            ConnectErrorCode.Unauthenticated,
          );
        }
        if (originConnections?.has(clientId)) {
          throw new ConnectError(
            `Client id collision: ${clientId}`,
            ConnectErrorCode.AlreadyExists,
          );
        }
      } catch (error) {
        console.error('Connection rejected', error);
        clientPort.postMessage({
          connected: false,
          reason: errorToJson(ConnectError.from(error), undefined),
        });
        clientPort.disconnect();
        return;
      }

      // create connection record
      const connection: BackgroundConnection = {
        tab,
        type: clientType as ChannelClientLabel,
        port: clientPort,
        sender,
        streams: new Map<string, AbortController>(),
        tlsChannelId,
        documentId,
      };
      originConnections?.set(clientId, connection);

      /**
       * This method is used to manage a response sub-channel, encapsulating a
       * response stream. A TransportInitChannel representing the channel is
       * returned for transport to the client. The client should respond by
       * opening a connection bearing this name.
       *
       * @param subStream ReadableStream to be transmitted via sub-channel
       */
      const responseSubChannel = ({ requestId, stream }: TransportStream): TransportInitChannel => {
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
          subPort.onDisconnect.addListener(() =>
            acont.abort(new DOMException(`Disconnecting sub ${channel}`, 'AbortError')),
          );
          void stream
            .pipeTo(new WritableStream(new ChromeRuntimeStreamSink(subPort)), {
              signal: acont.signal,
            })
            .catch((error: unknown) => {
              // This throw won't reach the client.  The failure has already
              // been transmitted in-channel by the stream sink if possible, and
              // the client source will fail in a meaningful way.
              if (
                !isChromePortDisconnected(error) &&
                !isAbortSubOnDisconnect(error, channel) &&
                !isAbortSubParentDisconnect(error, clientPort.name)
              )
                throw error;
            })
            .finally(() => {
              connection.streams.delete(channel);
              subPort.disconnect();
            });
        };
        chrome.runtime.onConnect.addListener(subListener);

        return { requestId, channel };
      };

      /**
       * Called by the listener to handle a single incoming transport message.
       * This should always *successfully* return a TransportEvent representing
       * a response or error from the service.
       */
      const clientMessageHandler = ({
        requestId,
        message,
      }: TransportMessage): Promise<TransportEvent> =>
        this.handler(message)
          .then(response =>
            response instanceof ReadableStream
              ? responseSubChannel({ requestId, stream: response })
              : { requestId, message: response },
          )
          .catch(error => ({ requestId, error: errorToJson(ConnectError.from(error), undefined) }));

      // attach listeners
      clientPort.onDisconnect.addListener(() => this.disconnectClient(sender.origin!, clientId));
      clientPort.onMessage.addListener((i: unknown, p: chrome.runtime.Port) => {
        void (async () => {
          try {
            let handlerResponse: TransportEvent | TransportError;
            if (isTransportMessage(i)) handlerResponse = await clientMessageHandler(i);
            else throw Error('Unknown item in transport');
            p.postMessage(handlerResponse);
          } catch (e) {
            if (!isChromePortDisconnected(e)) throw e;
          }
        })();
      });

      // setup finished, acknowledge connection
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

    connection.streams.forEach(acont =>
      acont.abort(new DOMException(`Disconnecting client ${connection.port.name}`, 'AbortError')),
    );
    connection.port.disconnect();
  };
}
