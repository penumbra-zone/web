import type { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient, PromiseClient, Transport } from '@connectrpc/connect';
import { jsonOptions } from '@penumbra-zone/protobuf';
import {
  ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { assertProviderConnected, assertProviderRecord } from './assert.js';
import { createPenumbraStateEvent, isPenumbraStateEvent, PenumbraEventDetail } from './event.js';
import { PenumbraEventListener } from './event-listener.js';
import {
  getPenumbraGlobalUnsafe,
  getPenumbraManifest,
  getPenumbraManifests,
  getPenumbraUnsafe,
} from './get.js';
import { PenumbraManifest } from './manifest.js';
import { PenumbraProvider } from './provider.js';
import { PenumbraState } from './state.js';
import { PenumbraRequestFailure } from './error.js';

const isLegacyProvider = (
  provider: PenumbraProvider,
): provider is PenumbraProvider & { request: () => Promise<void> } => 'request' in provider;

interface PenumbraClientOptions {
  /** Custom options for this client's `Transport`. */
  transportOptions: Omit<ChannelTransportOptions, 'getPort'>;
}

interface PenumbraClientConnection {
  port: Promise<MessagePort>;
  transport: Transport;
}

interface PenumbraClientAttachment {
  origin: string;
  provider: PenumbraProvider;
  confirmManifest: Promise<PenumbraManifest>;
  manifest?: PenumbraManifest;
}

/**
 * `PenumbraClient` is intended to be the 'entry' to the collection of service
 * APIs for dapp developers inspecting or interacting with a user's Penumbra
 * chain state.
 *
 * PenumbraClient static methods will allow you to
 *
 * - inspect available providers
 * - verify the provider is present
 * - choose a provider to connect
 *
 * If you're developing a dapp using penumbra, you should likely:
 *
 * - gate penumbra features, if no providers are installed
 * - display a button to initiate connection, if no providers are connected
 * - display a modal choice, if multiple providers are present
 *
 * When you've selected a provider, you can provide its origin URI to
 * `createPenumbraClient` or `new PenumbraClient`. This will create a client
 * attached to that provider, and you can then:
 *
 * - request permission to connect and create an active connection with `connect`
 * - access the provider's services with `service` and a `ServiceType` parameter
 * - release your permissions with `disconnect`
 */
export class PenumbraClient {
  // static features

  /** When using the `PenumbraClient` constructor directly, this is the default
   * value of the options parameter.
   *
   * When using `createPenumbraClient`, this object is spread into the options
   * parameter of the client constructor before the caller's options parameter.
   */
  public static readonly defaultOptions: PenumbraClientOptions = {
    transportOptions: { jsonOptions },
  };

  /** Return the record of all present providers available in the page. */
  public static getProviders(): Record<string, PenumbraProvider> {
    return getPenumbraGlobalUnsafe() ?? {};
  }

  /** Return a record of all present providers, and fetch their manifests. */
  public static getProviderManifests(): Record<string, Promise<PenumbraManifest>> {
    return getPenumbraGlobalUnsafe() ? getPenumbraManifests() : {};
  }

  /** Fetch manifest of a specific provider, or return `undefined` if the
   * provider is not present. */
  public static getProviderManifest(providerOrigin: string): Promise<PenumbraManifest> | undefined {
    return getPenumbraUnsafe(providerOrigin) && getPenumbraManifest(providerOrigin);
  }

  /** Return boolean connection state of a specific provider, or `undefined` if
   * the provider is not present. */
  public static isProviderConnected(providerOrigin: string): boolean | undefined {
    return getPenumbraUnsafe(providerOrigin)?.isConnected();
  }

  /** Return connection state enum of a specific provider, or `undefined` if the
   * provider is not present. */
  public static getProviderState(providerOrigin: string): PenumbraState | undefined {
    return getPenumbraUnsafe(providerOrigin)?.state();
  }

  // instance features

  private readonly serviceClients: Map<ServiceType, PromiseClient<ServiceType>>;
  private readonly stateListeners: Set<(detail: PenumbraEventDetail<'penumbrastate'>) => void>;
  private readonly providerEventListener: PenumbraEventListener;

  private connection?: PenumbraClientConnection;
  private attached?: PenumbraClientAttachment;

  /** Construct a client instance but take no specific action. Will immediately
   * attach to a specified provider, or remain unconfigured. */
  constructor(
    /** A provider origin may be provided during client construction to
     * immediately attach. If not, this client will not be able to connect or
     * report state information until `attach` is called to specify a provider
     * origin. */
    providerOrigin?: string | undefined,
    private readonly options = PenumbraClient.defaultOptions,
  ) {
    this.serviceClients = new Map();
    this.stateListeners = new Set();
    this.providerEventListener = evt => {
      if (this.attached?.origin && isPenumbraStateEvent(evt, this.attached.origin)) {
        this.stateListeners.forEach(listener => listener(evt.detail));
      }
    };
    if (providerOrigin) {
      void this.attach(providerOrigin);
    }
  }

  /**
   * It is recommended to construct clients with a specific provider origin. If
   * you didn't do that, and you're working with an unconfigured client, you can
   * configure it with `attach`.
   *
   * A client may only be attached once. A client must be attached to connect.
   *
   * Presence of the public `origin` field can confirm a client instance is
   * attached to a provider, and presence of the public `manifest` field can
   * confirm the attached provider served an appropriate manifest. You may await
   * manifest confirmation by awaiting the return of `attach`.
   *
   * If called again with a matching provider, `attach` is a no-op. If called
   * again with a different provider, `attach` will throw.
   */
  public async attach(providerOrigin: string): Promise<PenumbraManifest> {
    if (!this.attached) {
      this.attached ??= this.createAttached(providerOrigin);
      await this.attached.confirmManifest;

      // callbacks may already be listening for a transition out of the client's
      // unconfigured state, so emit a synthetic event reflecting the state of
      // the new provider.
      this.providerEventListener(
        createPenumbraStateEvent(this.attached.origin, this.attached.provider.state()),
      );
      this.attached.provider.addEventListener('penumbrastate', this.providerEventListener);
    }

    if (this.attached.origin !== providerOrigin) {
      throw new Error('Client already attached to a different provider.');
    }

    return this.attached.confirmManifest;
  }

  /** Attempt to connect to the attached provider. If this client is unattached,
   * a provider may be specified at this moment.
   *
   * May reject with an enumerated `PenumbraRequestFailure`.
   *
   * The public `connected` field will report the provider's connected state, or
   * `undefined` if this client is not attached to a provider. The public
   * `transport` field can confirm the client possesses an active connection.
   *
   * If called again while already connected, `connect` is a no-op.
   */
  public async connect(providerOrigin?: string): Promise<void> {
    if (providerOrigin) {
      await this.attach(providerOrigin);
    }
    this.connection ??= this.createConnection();

    // Connection timeouts, provider detachments, etc. appear similar to a connection denial.
    // Explicitly handle denial errors and propagate them back to the caller. Without this,
    // a denied connection would immediately trigger an attempt to re-establish the connection.
    try {
      await this.connection.port;
    } catch (error) {
      if (error instanceof Error && error.cause) {
        if (error.cause === PenumbraRequestFailure.Denied) {
          throw error;
        }
      }

      // todo: clean up existing connection resources and attempt to establish reconnection

      this.connection = this.createConnection();
      await this.connection.port;
    }
  }

  /** Call `disconnect` on the associated provider to release connection
   * approval, and destroy any present connection. */
  public async disconnect(): Promise<void> {
    const request = this.attached?.provider.disconnect();
    this.destroyConnection();
    await request;
  }

  /** Return a `PromiseClient<T>` for some `T extends ServiceType`, using this
   * client's internal `Transport`.
   *
   * If you call this method while this client is not `Connected`, this method
   * will throw.
   */
  public service<T extends ServiceType>(service: T): PromiseClient<T> {
    // TODO: find a way to remove this type cast
    let serviceClient = this.serviceClients.get(service) as PromiseClient<T> | undefined;

    if (!serviceClient) {
      serviceClient = createPromiseClient(service, this.assertConnected().transport);
      this.serviceClients.set(service, serviceClient);
    }

    return serviceClient;
  }

  /** Simplified callback interface to the `EventTarget` interface of the
   * associated provider. */
  public onConnectionStateChange(
    listener: (detail: PenumbraEventDetail<'penumbrastate'>) => void,
    removeListener?: AbortSignal,
  ) {
    if (removeListener?.aborted) {
      this.stateListeners.delete(listener);
    } else {
      removeListener?.addEventListener('abort', () => this.stateListeners.delete(listener));
      this.stateListeners.add(listener);
    }
  }

  // public fields requiring connection

  /** The promised `MessagePort` returned from this client's provider. */
  public get port(): Promise<MessagePort> | undefined {
    return this.connection?.port;
  }

  /** The ConnectRPC `Transport` created by this client's connection. */
  public get transport(): Transport | undefined {
    return this.connection?.transport;
  }

  // public fields requiring attachment

  /** The provider origin URI, or `undefined` if this client is not attached. */
  public get origin(): string | undefined {
    return this.attached?.origin;
  }

  /** The attached provider, or `undefined` if this client is not attached. */
  public get provider(): PenumbraProvider | undefined {
    return this.attached?.provider;
  }

  /** The boolean provider connection status, or `undefined` if this client is
   * not attached to a provider. */
  public get connected(): boolean | undefined {
    return this.attached?.provider.isConnected();
  }

  /** The `PenumbraState` enumerated provider connection state, or `undefined` if
   * this client is not attached to a provider. */
  public get state(): PenumbraState | undefined {
    return this.attached?.provider.state();
  }

  /** The parsed `PenumbraManifest` associated with this provider, fetched at
   * time of provider attach. This will be `undefined` if this client is not
   * attached to a provider, or if the manifest fetch has not yet resolved.
   *
   * If you have awaited the return of `attach` or `connect`, this should be
   * present.
   */
  public get manifest(): PenumbraManifest | undefined {
    return this.attached?.manifest;
  }

  // private methods

  /** Assert an attached provider. */
  private assertAttached(): PenumbraClientAttachment {
    assertProviderRecord(this.attached?.origin);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify
    return this.attached!;
  }

  /** Assert a connected provider, and potentially init this client's transport. */
  private assertConnected(): PenumbraClientConnection {
    assertProviderConnected(this.attached?.origin);
    this.connection ??= this.createConnection();
    return this.connection;
  }

  /** Create attachment to a specific provider, and return without waiting. */
  private createAttached(providerOrigin: string): PenumbraClientAttachment {
    const attached: PenumbraClientAttachment = {
      confirmManifest: getPenumbraManifest(providerOrigin),
      manifest: undefined,
      origin: providerOrigin,
      provider: assertProviderRecord(providerOrigin),
    };
    void attached.confirmManifest.then(manifest => (attached.manifest = manifest));
    return attached;
  }

  /** Request a connection to the attached provider, and return the pending
   * `MessagePort` and created `Transport` without waiting. */
  private createConnection(): PenumbraClientConnection {
    const { confirmManifest, provider } = this.assertAttached();

    // requestPort will resolve to the provider's message port if connection
    // is successful. this promise is not awaited so that this method may be
    // called synchronously.
    const requestPort: Promise<MessagePort> = confirmManifest.then(async () => {
      if (isLegacyProvider(provider)) {
        await provider.request();
      }
      return provider.connect();
    });

    const connection: PenumbraClientConnection = {
      port: requestPort,
      transport: createChannelTransport({
        ...this.options.transportOptions,
        getPort: () => requestPort,
      }),
    };

    return connection;
  }

  /** Destroy any active connection and discard existing clients. */
  private destroyConnection() {
    void this.connection?.port.then(port => {
      port.postMessage(false);
      port.close();
    });
    this.connection = undefined;
    this.serviceClients.clear();
  }
}

/** Construct a client instance but take no specific action. Will immediately
 * attach to a specified provider, or remain unconfigured. */
export const createPenumbraClient = (
  providerOrigin?: string,
  opt?: Partial<PenumbraClientOptions>,
) => new PenumbraClient(providerOrigin, { ...PenumbraClient.defaultOptions, ...opt });
