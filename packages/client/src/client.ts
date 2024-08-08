import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient, PromiseClient, Transport } from '@connectrpc/connect';
import { jsonOptions } from '@penumbra-zone/protobuf';
import {
  ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { assertProviderConnected, assertProviderManifest, assertProviderRecord } from './assert.js';
import { isPenumbraStateEvent, PenumbraEventDetail } from './event.js';
import { PenumbraEventListener } from './event-listener.js';
import {
  getAllPenumbraManifests,
  getPenumbraGlobalUnsafe,
  getPenumbraManifest,
  getPenumbraUnsafe,
} from './get.js';
import { PenumbraManifest } from './manifest.js';
import { PenumbraProvider } from './provider.js';
import { PenumbraState } from './state.js';

export class PenumbraClient {
  // static features

  /** Return true if any provider is present. */
  public static penumbraInstalled(): boolean {
    const penumbraGlobal = getPenumbraGlobalUnsafe();
    return Boolean(penumbraGlobal && Object.values(penumbraGlobal).length);
  }

  /** Return the record of all present providers available in the page. */
  public static getAllProviders(): Record<string, PenumbraProvider> {
    return getPenumbraGlobalUnsafe() ?? {};
  }

  /** Return a list of all present provider origins available in the page. */
  public static getAllProviderOrigins(): string[] {
    return Object.keys(getPenumbraGlobalUnsafe() ?? {});
  }

  /** Return a record of all present providers, and fetch their manifests. */
  public static getAllProviderManifests(): Record<string, Promise<PenumbraManifest>> {
    return getPenumbraGlobalUnsafe() ? getAllPenumbraManifests() : {};
  }

  /** Fetch manifest of a specific provider, or return `undefined` if the
   * provider is not present. */
  public static getManifest(providerOrigin: string): Promise<PenumbraManifest> | undefined {
    return getPenumbraUnsafe(providerOrigin) && getPenumbraManifest(providerOrigin);
  }

  /** Return boolean connection state of a specific provider, or `undefined` if
   * the provider is not present. */
  public static isConnected(providerOrigin: string): boolean | undefined {
    return getPenumbraUnsafe(providerOrigin)?.isConnected();
  }

  /** Return connection state enum of a specific provider, or `undefined` if the
   * provider is not present. */
  public static getState(providerOrigin: string): PenumbraState | undefined {
    return getPenumbraUnsafe(providerOrigin)?.state();
  }

  /** Make a connection attempt to a specific provider, and return a client bound
   * to that provider if successful. May reject with an enumerated
   * `PenumbraRequestFailure`. */
  public static async connect(
    requireProvider: string,
    transportOptions = { jsonOptions } as ChannelTransportOptions,
  ): Promise<PenumbraClient> {
    await assertProviderManifest(requireProvider);
    const client = new PenumbraClient(requireProvider, transportOptions);
    await client.connect();
    return client;
  }

  /** Create client, bound to `requireProvider` if specified, but do not attempt
   * to request a connection. */
  public static create(
    requireProvider?: string,
    transportOptions = { jsonOptions } as ChannelTransportOptions,
  ) {
    return new PenumbraClient(requireProvider, transportOptions);
  }

  // instance features

  private readonly serviceClients = new Map<ServiceType['typeName'], PromiseClient<ServiceType>>();
  private readonly stateListeners = new Set<
    (detail: PenumbraEventDetail<'penumbrastate'>) => void
  >();

  private connection?: {
    port: Promise<MessagePort>;
    transport: Transport;
  };

  private config?: {
    origin: string;
    provider: PenumbraProvider;
    requestManifest: Promise<PenumbraManifest>;
    parsedManifest?: PenumbraManifest;
  };

  private readonly providerEventListener: PenumbraEventListener = evt => {
    if (this.config?.origin && isPenumbraStateEvent(evt, this.config.origin)) {
      this.stateListeners.forEach(listener => listener(evt.detail));
    }
  };

  /** Construct an instance representing connection to a specific provider,
   * identified by the origin parameter, but take to specific action. */
  private constructor(
    /** A provider origin may be provided during client construction. */
    providerOrigin?: string,
    /** Custom options for this client's `Transport`. */
    public readonly transportOptions?: Omit<ChannelTransportOptions, 'getPort'>,
  ) {
    if (providerOrigin) {
      this.config = this.createConfig(providerOrigin);
    }
  }

  /** Configure this client. */
  private createConfig(providerOrigin: string) {
    if (this.config) {
      throw new Error('Client already configured');
    }
    const config = {
      parsedManifest: undefined as PenumbraManifest | undefined,
      origin: providerOrigin,
      provider: assertProviderRecord(providerOrigin),
      requestManifest: getPenumbraManifest(providerOrigin),
    };
    void config.requestManifest.then(manifest => {
      config.provider.addEventListener('penumbrastate', this.providerEventListener);
      config.parsedManifest = manifest;
    });
    return config;
  }

  /** Assert client is configured. */
  private assertConfig(providerOrigin?: string) {
    if (!this.config) {
      throw new Error('Client not configured');
    }
    if (providerOrigin && this.config.origin !== providerOrigin) {
      throw new Error('Client configuration mismatched');
    }
    return this.config;
  }

  /** Connect to the configured provider. */
  private createConnection() {
    const { requestManifest, provider } = this.assertConfig();
    const request = requestManifest.then(() => provider.connect());
    return {
      transport: createChannelTransport({
        jsonOptions,
        ...this.transportOptions,
        getPort: () => request,
      }),
      port: request,
    };
  }

  /** The promised `MessagePort` returned from this client's provider. */
  get port(): Promise<MessagePort> | undefined {
    return this.connection?.port;
  }

  /** The ConnectRPC `Transport` created by this client's connection. */
  get transport(): Transport | undefined {
    return this.connection?.transport;
  }

  /** The provider origin URI, or `undefined` if this client is not configured
   * with a provider. */
  get origin(): string | undefined {
    return this.config?.origin;
  }

  /** The boolean provider connection status, or `undefined` if this client is
   * not configured with a provider. */
  get connected(): boolean | undefined {
    return this.config?.provider.isConnected();
  }

  /** The `PenumbraState` enumerated provider connection state, or `undefined` if
   * this client is not configured with a provider. */
  get state(): PenumbraState | undefined {
    return this.config?.provider.state();
  }

  /** The parsed `PenumbraManifest` associated with this provider, fetched at
   * time of client configuration. This will be `undefined` if this client is
   * not configured with a provider, or if the manifest fetch has not yet
   * resolved.
   *
   * If you hold an active connection to this provider, this should be present.
   */
  get manifest(): PenumbraManifest | undefined {
    return this.config?.parsedManifest;
  }

  /** Return a promised `PenumbraManifest` associated with this provider, fetched
   * at time of client configuration, or `undefined` if this client is not
   * configured with a provider.
   *
   * May reject if the manifest is not available. If you hold an active
   * connection to this provider, this promise should successfully resolve.
   */
  fetchManifest(): Promise<PenumbraManifest> | undefined {
    return this.config?.requestManifest;
  }

  /** Return the `Transport` representing the present connection, or create it if
   * necessary by calling `connect` to obtain a `MessagePort` from the
   * associated provider. An unconfigured client may be configured at this
   * moment with the `providerOrigin` string parameter. */
  public async connect(providerOrigin?: string): Promise<void> {
    if (providerOrigin) {
      this.config ??= this.createConfig(providerOrigin);
    }
    const { requestManifest, provider } = this.assertConfig(providerOrigin);
    await requestManifest;
    await provider.connect();
    this.assertConnection();
  }

  /** Assert an active connection, and potentially init this client's transport. */
  private assertConnection() {
    assertProviderConnected(this.config?.origin);
    this.connection ??= this.createConnection();
    return this.connection;
  }

  /** Destroy any active connection and clients. */
  private destroyConnection() {
    void this.connection?.port.then(port => {
      port.postMessage(false);
      port.close();
    });
    this.connection = undefined;
    this.serviceClients.clear();
  }

  /** Destroy any present connection, and call `disconnect` on the associated
   * provider to release connection approval. If there is no present
   * configuration, returns `undefined`. */
  public disconnect(): Promise<void> | undefined {
    const request = this.config?.provider.disconnect();
    this.destroyConnection();
    return request;
  }

  private connectService<T extends ServiceType>(service: T) {
    const { transport } = this.assertConnection();
    return createPromiseClient(service, transport);
  }

  /** Return a `PromiseClient<T>` for some `T extends ServiceType`, using this
   * client's internal `Transport`. If you call this method before
   * configuration, this method will throw.
   *
   * You should prefer to call this method *after* this client's connection has
   * succeeded.
   *
   * If you call this method before a connection is resolved, a connection will
   * be initiated but will not be awaited (as this is a synchronous method). If
   * a connection initated this way is rejected, or does not resolve within the
   * `defaultTimeoutMs` of this client's `transportOptions`, requests made with
   * the returned `PromiseClient<T>` will throw.
   */
  public service<T extends ServiceType>(service: T) {
    return (
      (this.serviceClients.get(service.typeName) as PromiseClient<T> | undefined) ??
      (this.serviceClients
        .set(service.typeName, this.connectService(service))
        .get(service.typeName) as PromiseClient<T>)
    );
  }

  get addEventListener(): PenumbraProvider['addEventListener'] | undefined {
    return this.config?.provider.addEventListener.bind(this.config.provider);
  }
  get removeEventListener(): PenumbraProvider['removeEventListener'] | undefined {
    return this.config?.provider.removeEventListener.bind(this.config.provider);
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
}
